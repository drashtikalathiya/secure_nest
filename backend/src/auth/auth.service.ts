import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import admin from '../../config/firebase-admin';
import { InvitationsService } from '../invitations/invitations.service';
import { getErrorMessage } from '../utils/errorMessage';
import { CloudinaryService } from '../users/cloudinary.service';
import { PermissionsService } from '../permissions/permissions.service';
import * as nodemailer from 'nodemailer';
import {
  SUBSCRIPTION_PLANS,
  USER_ROLES,
  type SubscriptionPlan,
} from '../utils/constants';
import { renderPasswordResetEmailHtml } from '../utils/emailTemplates';
import type {
  AuthResponseDto,
  FirebaseUserDto,
  ForgotPasswordDto,
  RegisterUserDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly invitationsService: InvitationsService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async uploadSignupProfilePhoto(
    firebaseUser: FirebaseUserDto,
    file?: { buffer: Buffer; mimetype: string; size: number },
  ): Promise<string> {
    this.validateProfilePhoto(file);

    const firebaseUid =
      typeof firebaseUser?.uid === 'string' ? firebaseUser.uid.trim() : '';
    if (!firebaseUid) {
      throw new BadRequestException('Invalid firebase user.');
    }

    try {
      return await this.cloudinaryService.uploadProfilePhoto(
        file!,
        firebaseUid,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        this.getSafeErrorMessage(error, 'Failed to upload profile photo.'),
      );
    }
  }

  async validateUser(firebaseUser: FirebaseUserDto): Promise<AuthResponseDto> {
    const { uid } = firebaseUser;

    const user = await this.userRepo.findOne({
      where: { firebase_uid: uid },
    });

    if (!user) {
      throw new NotFoundException('User is not registered.');
    }

    await this.ensureOwnerFamilyId(user);

    return this.buildAuthResponse(user);
  }

  async registerUser(
    firebaseUser: FirebaseUserDto,
    body: RegisterUserDto,
  ): Promise<AuthResponseDto> {
    const { uid, email } = firebaseUser;
    const inviteToken = body?.inviteToken?.toString().trim() || null;
    const photoUrl =
      typeof body?.photo_url === 'string' && body.photo_url.trim()
        ? body.photo_url.trim()
        : null;

    const existingUser = await this.userRepo.findOne({
      where: { firebase_uid: uid },
    });

    if (existingUser && inviteToken) {
      throw new BadRequestException(
        'An account already exists for this invitation.',
      );
    }

    if (existingUser) {
      return this.buildAuthResponse(existingUser);
    }

    if (!email) {
      throw new ForbiddenException('Email is required.');
    }

    return inviteToken
      ? this.registerMember(uid, email, body?.name, inviteToken, photoUrl)
      : this.registerOwner(uid, email, body?.name, photoUrl);
  }

  async requestPasswordReset(body: ForgotPasswordDto): Promise<void> {
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    if (!email) {
      throw new BadRequestException('Email is required.');
    }

    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('No account found with that email.');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const firebaseResetLink = await admin
      .auth()
      .generatePasswordResetLink(email, {
        url: `${frontendUrl}/reset-password`,
      });

    const resetUrl = new URL(firebaseResetLink);
    const oobCode = resetUrl.searchParams.get('oobCode');
    if (!oobCode) {
      throw new InternalServerErrorException(
        'Failed to generate password reset link.',
      );
    }

    const resetLink = `${frontendUrl}/reset-password?oobCode=${encodeURIComponent(
      oobCode,
    )}`;

    await this.sendPasswordResetEmail({
      recipientEmail: email,
      recipientName: user.name || undefined,
      resetLink,
    });
  }

  private async registerOwner(
    uid: string,
    email: string,
    name?: string,
    profilePhotoUrl?: string | null,
  ): Promise<AuthResponseDto> {
    let user = this.userRepo.create({
      firebase_uid: uid,
      email,
      name: name || null,
      profile_photo_url: profilePhotoUrl || null,
      role: USER_ROLES.OWNER,
      subscription_plan: SUBSCRIPTION_PLANS.SMALL,
      permission_profile_id: null,
    });

    user = await this.userRepo.save(user);

    user.family_owner_id = user.id;
    await this.userRepo.save(user);

    return this.buildAuthResponse(user);
  }

  private async registerMember(
    uid: string,
    email: string,
    name: string | undefined,
    inviteToken: string,
    profilePhotoUrl?: string | null,
  ): Promise<AuthResponseDto> {
    const invite = await this.invitationsService.validateInviteForRegister(
      inviteToken,
      email,
    );

    let member = this.userRepo.create({
      firebase_uid: uid,
      email,
      name: name || null,
      profile_photo_url: profilePhotoUrl || null,
      role: USER_ROLES.MEMBER,
      permission_profile_id: null,
    });

    member = await this.userRepo.save(member);

    await this.invitationsService.completeInviteForRegisteredUser(
      invite,
      member,
    );

    const syncedMember = await this.userRepo.findOne({
      where: { id: member.id },
    });

    if (!syncedMember) {
      throw new NotFoundException('User is not registered.');
    }

    return this.buildAuthResponse(syncedMember);
  }

  private async buildAuthResponse(user: User): Promise<AuthResponseDto> {
    const payload = await this.authPayload(user);
    await this.syncFirebaseClaims(
      user,
      payload.is_subscribed,
      payload.subscription_plan,
    );
    return payload;
  }

  private async authPayload(user: User): Promise<AuthResponseDto> {
    const owner = await this.getOwnerForUser(user);
    const isSubscribed =
      user.role === USER_ROLES.OWNER
        ? Boolean(user.is_subscribed)
        : Boolean(owner?.is_subscribed);
    const subscriptionPlan =
      owner?.subscription_plan ||
      user.subscription_plan ||
      SUBSCRIPTION_PLANS.SMALL;

    if (
      user.role === USER_ROLES.MEMBER &&
      user.subscription_plan !== subscriptionPlan
    ) {
      await this.userRepo.update(user.id, {
        subscription_plan: subscriptionPlan,
      });
      user.subscription_plan = subscriptionPlan;
    }

    const permissions = await this.permissionsService.resolveUserPayload(user);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profile_photo_url: user.profile_photo_url,
      role: user.role,
      family_owner_id: user.family_owner_id,
      is_subscribed: isSubscribed,
      subscription_plan: subscriptionPlan,
      permission_password_access_level: permissions.passwordAccess,
      permission_contacts_access_level: permissions.contactsAccess,
      permission_documents_access_level: permissions.documentsAccess,
      permission_invite_others: permissions.inviteOthers,
      permission_export_data: permissions.exportData,
    };
  }

  private async getOwnerForUser(user: User): Promise<User | null> {
    if (user.role === USER_ROLES.OWNER) {
      return user;
    }

    if (!user.family_owner_id) {
      return null;
    }

    return this.userRepo.findOne({
      where: { id: user.family_owner_id, role: USER_ROLES.OWNER },
    });
  }

  private async ensureOwnerFamilyId(user: User) {
    if (user.role === USER_ROLES.OWNER && !user.family_owner_id) {
      user.family_owner_id = user.id;
      await this.userRepo.save(user);
    }
  }

  private async syncFirebaseClaims(
    user: User,
    effectiveSubscription: boolean,
    subscriptionPlan: SubscriptionPlan,
  ): Promise<void> {
    try {
      const userRecord = await admin.auth().getUser(user.firebase_uid);

      const nextClaims = {
        ...(userRecord.customClaims || {}),
        role: user.role,
        is_subscribed: Boolean(effectiveSubscription),
        subscription_plan: subscriptionPlan,
        ...(user.name && { name: user.name }),
        ...(user.profile_photo_url && {
          profile_photo_url: user.profile_photo_url,
        }),
      };

      await admin.auth().setCustomUserClaims(user.firebase_uid, nextClaims);

      if (
        (user.name && userRecord.displayName !== user.name) ||
        (user.profile_photo_url &&
          userRecord.photoURL !== user.profile_photo_url)
      ) {
        await admin.auth().updateUser(user.firebase_uid, {
          ...(user.name ? { displayName: user.name } : {}),
          ...(user.profile_photo_url
            ? { photoURL: user.profile_photo_url }
            : {}),
        });
      }
    } catch (error) {
      console.error('Failed to sync Firebase claims:', {
        uid: user.firebase_uid,
        message: getErrorMessage(error),
      });
    }
  }

  private async sendPasswordResetEmail(params: {
    recipientEmail: string;
    resetLink: string;
    recipientName?: string;
  }) {
    const host = process.env.MAIL_HOST;
    const port = Number(process.env.MAIL_PORT || 587);
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    if (!host || !user || !pass) {
      throw new InternalServerErrorException(
        'Email service is not configured.',
      );
    }

    try {
      const secure =
        String(process.env.MAIL_SECURE || 'false').toLowerCase() === 'true';
      const appName = process.env.MAIL_FROM_NAME || 'SecureNest';
      const supportEmail =
        process.env.SUPPORT_EMAIL || process.env.MAIL_FROM || user;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const frontendDomain = new URL(frontendUrl).host;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `${appName} <${process.env.MAIL_FROM || user}>`,
        to: params.recipientEmail,
        subject: `${appName} password reset`,
        html: renderPasswordResetEmailHtml({
          appName,
          resetLink: this.escapeHtml(params.resetLink),
          supportEmail: this.escapeHtml(supportEmail),
          frontendDomain: this.escapeHtml(frontendDomain),
          recipientName: params.recipientName
            ? this.escapeHtml(params.recipientName)
            : undefined,
        }),
      });
    } catch (error) {
      console.error('Password reset email send failed:', {
        message: getErrorMessage(error),
      });
      throw new InternalServerErrorException(
        'Failed to send password reset email.',
      );
    }
  }

  private escapeHtml(value: string): string {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private validateProfilePhoto(file?: {
    mimetype: string;
    size: number;
  }): void {
    if (!file) {
      throw new BadRequestException('Profile photo file is required.');
    }

    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed.');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('Profile photo must be 2MB or smaller.');
    }
  }

  private getSafeErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  }
}
