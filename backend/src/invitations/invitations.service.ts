import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import admin from '../../config/firebase-admin';
import { Invitation } from './invitation.entity';
import { User } from '../users/user.entity';
import { DocumentsService } from '../documents/documents.service';
import { getErrorMessage } from '../utils/errorMessage';
import { renderInvitationEmailHtml } from '../utils/emailTemplates';
import { createTransporter, escapeHtml, getMailConfig } from '../utils/email';
import { getPlanMemberLimit } from '../billing/subscription-plan';
import { DEFAULT_MEMBER_PERMISSIONS } from '../permissions/permissions.utils';
import { PermissionsService } from '../permissions/permissions.service';
import {
  SUBSCRIPTION_PLANS,
  USER_ROLES,
  type SubscriptionPlan,
  type UserRole,
} from '../utils/constants';
import type { CreateInvitationDto } from './dto/invitations.dto';

const INVITE_EXPIRY_DAYS = 7;

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private inviteRepo: Repository<Invitation>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private permissionsService: PermissionsService,
    private documentsService: DocumentsService,
  ) {}

  async createInvitation(firebaseUid: string, body: CreateInvitationDto) {
    const owner = await this.getOwnerByFirebaseUid(
      firebaseUid,
      'Only an owner can send invitations.',
    );

    await this.ensureOwnerWithinSubscriptionMemberLimit(owner);

    const email = String(body?.email || '')
      .trim()
      .toLowerCase();
    const role = String(body?.role || USER_ROLES.MEMBER).toLowerCase();

    if (!email) {
      throw new BadRequestException('Email is required.');
    }

    if (role !== USER_ROLES.MEMBER) {
      throw new BadRequestException('Only member invitations are allowed.');
    }

    await this.ensureEmailIsInvitable(email, owner.id);

    const permissionProfileId = await this.permissionsService.createProfile(
      owner.id,
      body,
      DEFAULT_MEMBER_PERMISSIONS,
    );

    const { token, expiresAt, inviteLink } = this.generateInviteAccess();

    await this.sendInvitationEmail({
      inviteeEmail: email,
      ownerName: this.getOwnerDisplayName(owner),
      inviteLink,
      expiresAt,
    });

    const invite = this.inviteRepo.create({
      owner_id: owner.id,
      email,
      role: USER_ROLES.MEMBER,
      permission_profile_id: permissionProfileId,
      token,
      status: 'pending',
      expires_at: expiresAt,
    });

    const savedInvite = await this.inviteRepo.save(invite);

    return {
      ...(await this.mapInviteResponse(savedInvite)),
      invite_link: inviteLink,
    };
  }

  async listPendingInvitations(firebaseUid: string) {
    const owner = await this.getOwnerByFirebaseUid(
      firebaseUid,
      'Only an owner can view invitations.',
    );

    const invites = await this.inviteRepo.find({
      where: { owner_id: owner.id, status: 'pending' },
      order: { created_at: 'DESC' },
    });

    return Promise.all(invites.map((invite) => this.mapInviteResponse(invite)));
  }

  async resendInvitation(firebaseUid: string, invitationId: string) {
    const { owner, invite } = await this.getOwnerPendingInvite(
      firebaseUid,
      invitationId,
      'Only pending invitations can be resent.',
    );

    await this.ensureOwnerWithinSubscriptionMemberLimit(owner);

    const { token, expiresAt, inviteLink } = this.generateInviteAccess();

    await this.sendInvitationEmail({
      inviteeEmail: invite.email,
      ownerName: this.getOwnerDisplayName(owner),
      inviteLink,
      expiresAt,
    });

    await this.inviteRepo.update(invite.id, {
      token,
      expires_at: expiresAt,
    });

    return {
      ...(await this.mapInviteResponse({
        ...invite,
        token,
        expires_at: expiresAt,
      })),
      invite_link: inviteLink,
    };
  }

  async cancelInvitation(firebaseUid: string, invitationId: string) {
    const { invite } = await this.getOwnerPendingInvite(
      firebaseUid,
      invitationId,
      'Only pending invitations can be deleted.',
    );

    await this.inviteRepo.delete({ id: invite.id });
  }

  async validateToken(token: string) {
    const invite = await this.getInviteByToken(token);
    const permissions = await this.mapInvitePermissions(invite);

    if (invite.status !== 'pending') {
      return {
        valid: false,
        reason: invite.status === 'accepted' ? 'ALREADY_ACCEPTED' : 'INVALID',
        email: invite.email,
        role: invite.role,
        permissions,
      };
    }

    if (await this.handleIfExpired(invite)) {
      return {
        valid: false,
        reason: 'EXPIRED',
        email: invite.email,
        role: invite.role,
        permissions,
      };
    }

    const existingUser = await this.userRepo.findOne({
      where: { email: invite.email },
    });

    return {
      valid: true,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expires_at: invite.expires_at,
      has_account: Boolean(existingUser),
      permissions,
    };
  }

  async acceptInvitation(token: string, firebaseUid: string) {
    const invite = await this.getValidPendingInviteByToken(token);

    const user = await this.getUserByFirebaseUid(firebaseUid);

    if (!this.isSameEmail(user.email, invite.email)) {
      throw new ForbiddenException(
        'Signed-in email does not match the invitation email.',
      );
    }

    const owner = await this.findOwnerById(invite.owner_id);

    return this.applyAcceptedInvitation(invite, user, owner);
  }

  async validateInviteForRegister(token: string, email: string) {
    const invite = await this.getValidPendingInviteByToken(token);

    if (!this.isSameEmail(email, invite.email)) {
      throw new ForbiddenException(
        'Signed-in email does not match the invitation email.',
      );
    }

    return invite;
  }

  async completeInviteForRegisteredUser(invite: Invitation, user: User) {
    const owner = await this.findOwnerById(invite.owner_id);
    return this.applyAcceptedInvitation(invite, user, owner);
  }

  private async ensureEmailIsInvitable(email: string, ownerId: string) {
    const existingUser = await this.userRepo.findOne({ where: { email } });

    if (existingUser) {
      const existingOwnerId =
        existingUser.role === USER_ROLES.OWNER
          ? existingUser.id
          : existingUser.family_owner_id;

      if (existingOwnerId === ownerId) {
        throw new BadRequestException(
          'This email is already part of your family.',
        );
      }

      throw new BadRequestException(
        'This email is already used by another owner.',
      );
    }

    const existingInvites = await this.inviteRepo.find({
      where: { email },
      order: { created_at: 'DESC' },
    });

    if (existingInvites.length) {
      const hasOtherOwnerInvite = existingInvites.some(
        (invite) => invite.owner_id !== ownerId,
      );

      if (hasOtherOwnerInvite) {
        throw new BadRequestException(
          'This email is already used by another owner.',
        );
      }

      throw new BadRequestException(
        'This email has already been invited by you.',
      );
    }
  }

  private async getValidPendingInviteByToken(token: string) {
    const invite = await this.getInviteByToken(token);

    if (invite.status !== 'pending') {
      throw new BadRequestException('This invitation is no longer pending.');
    }

    const expired = await this.handleIfExpired(invite);
    if (expired) {
      throw new BadRequestException('This invitation has expired.');
    }

    return invite;
  }

  private async handleIfExpired(invite: Invitation): Promise<boolean> {
    if (this.isExpired(invite.expires_at)) {
      await this.inviteRepo.update(invite.id, { status: 'expired' });
      return true;
    }
    return false;
  }

  private async getInviteByToken(token: string) {
    const invite = await this.inviteRepo.findOne({ where: { token } });
    if (!invite) {
      throw new NotFoundException('Invitation was not found.');
    }
    return invite;
  }

  private async getOwnerPendingInvite(
    firebaseUid: string,
    invitationId: string,
    message: string,
  ) {
    const owner = await this.getOwnerByFirebaseUid(firebaseUid, message);
    const invite = await this.findOwnerInvite(invitationId, owner.id);

    if (invite.status !== 'pending') {
      throw new BadRequestException(message);
    }

    return { owner, invite };
  }

  private async mapInviteResponse(invite: Partial<Invitation>) {
    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      token: invite.token,
      expires_at: invite.expires_at,
      permissions: await this.mapInvitePermissions(invite),
    };
  }

  private async getUserByFirebaseUid(firebaseUid: string) {
    const user = await this.userRepo.findOne({
      where: { firebase_uid: firebaseUid },
    });
    if (!user) {
      throw new NotFoundException('User account was not found.');
    }
    return user;
  }

  private async getOwnerByFirebaseUid(firebaseUid: string, message: string) {
    const user = await this.getUserByFirebaseUid(firebaseUid);
    if (user.role !== USER_ROLES.OWNER) {
      throw new ForbiddenException(message);
    }
    return user;
  }

  private async findOwnerById(ownerId: string) {
    const owner = await this.userRepo.findOne({
      where: { id: ownerId, role: USER_ROLES.OWNER },
    });
    if (!owner) {
      throw new NotFoundException('Invitation owner was not found.');
    }
    return owner;
  }

  private async findOwnerInvite(invitationId: string, ownerId: string) {
    const invite = await this.inviteRepo.findOne({
      where: { id: invitationId, owner_id: ownerId },
    });
    if (!invite) {
      throw new NotFoundException('Invitation was not found.');
    }
    return invite;
  }

  private getOwnerDisplayName(owner: User) {
    return owner.name || owner.email;
  }

  private generateInviteAccess() {
    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 86400000);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return {
      token,
      expiresAt,
      inviteLink: `${frontendUrl}/invite/accept?token=${token}`,
    };
  }

  private isExpired(date: Date) {
    return new Date(date).getTime() < Date.now();
  }

  private isSameEmail(a: string, b: string) {
    return a.trim().toLowerCase() === b.trim().toLowerCase();
  }

  private async applyAcceptedInvitation(
    invite: Invitation,
    user: User,
    owner: User,
  ) {
    await this.ensureOwnerWithinSubscriptionMemberLimit(owner);

    await this.userRepo.update(user.id, {
      role: USER_ROLES.MEMBER,
      family_owner_id: owner.id,
      permission_profile_id: invite.permission_profile_id || null,
    });

    await this.documentsService.ensureUserFolder(owner.id, user);

    await this.inviteRepo.update(invite.id, {
      status: 'accepted',
      accepted_at: new Date(),
      accepted_by_user_id: user.id,
    });

    const effectiveSubscription = Boolean(owner.is_subscribed);

    await this.syncFirebaseClaims(
      user.firebase_uid,
      USER_ROLES.MEMBER,
      effectiveSubscription,
      owner.subscription_plan,
    );

    const permissions = await this.mapInvitePermissions(invite);

    return {
      role: USER_ROLES.MEMBER,
      is_subscribed: effectiveSubscription,
      family_owner_id: owner.id,
      subscription_plan: owner.subscription_plan,
      permission_password_access_level: permissions.passwordAccess,
      permission_contacts_access_level: permissions.contactsAccess,
      permission_documents_access_level: permissions.documentsAccess,
      permission_invite_others: permissions.inviteOthers,
      permission_export_data: permissions.exportData,
    };
  }

  private async mapInvitePermissions(invite: Partial<Invitation>) {
    return this.permissionsService.getPayloadByProfileId(
      invite.permission_profile_id,
      DEFAULT_MEMBER_PERMISSIONS,
    );
  }

  private async ensureOwnerWithinSubscriptionMemberLimit(owner: User) {
    if (!owner.is_subscribed) {
      throw new BadRequestException('Active subscription is required.');
    }

    const memberLimit = getPlanMemberLimit(owner.subscription_plan);
    const activeMembers = await this.userRepo.count({
      where: { family_owner_id: owner.id, role: USER_ROLES.MEMBER },
    });

    if (activeMembers >= memberLimit) {
      throw new BadRequestException(
        `Member limit reached for ${this.getPlanLabel(owner.subscription_plan)} plan (max ${memberLimit} members).`,
      );
    }
  }

  private getPlanLabel(plan: SubscriptionPlan) {
    return plan === SUBSCRIPTION_PLANS.FAMILY ? 'Family Nest' : 'Small Nest';
  }

  private async syncFirebaseClaims(
    firebaseUid: string,
    role: UserRole,
    isSubscribed: boolean,
    subscriptionPlan: SubscriptionPlan,
  ) {
    try {
      const userRecord = await admin.auth().getUser(firebaseUid);
      const existingClaims = userRecord.customClaims || {};

      await admin.auth().setCustomUserClaims(firebaseUid, {
        ...existingClaims,
        role,
        is_subscribed: isSubscribed,
        subscription_plan: subscriptionPlan,
      });
    } catch (error) {
      console.error('Failed to sync invitation claims', {
        uid: firebaseUid,
        message: getErrorMessage(error),
      });
    }
  }

  private async sendInvitationEmail(params: {
    inviteeEmail: string;
    ownerName: string;
    inviteLink: string;
    expiresAt: Date;
  }) {
    try {
      const mail = getMailConfig();
      const ownerName = escapeHtml(params.ownerName);
      const inviteLink = escapeHtml(params.inviteLink);
      const expiresAtUtc = params.expiresAt.toUTCString();
      const transporter = createTransporter(mail);

      await transporter.sendMail({
        from: `${mail.appName} <${mail.from}>`,
        to: params.inviteeEmail,
        subject: `${params.ownerName} invited you to ${mail.appName}`,
        html: renderInvitationEmailHtml({
          appName: mail.appName,
          ownerName,
          inviteLink,
          expiresAtUtc,
          supportEmail: escapeHtml(mail.supportEmail),
          frontendDomain: escapeHtml(mail.frontendDomain),
        }),
      });
    } catch (error) {
      console.error('Invitation email send failed:', {
        message: getErrorMessage(error),
      });
      throw new InternalServerErrorException(
        'Failed to send invitation email.',
      );
    }
  }
}
