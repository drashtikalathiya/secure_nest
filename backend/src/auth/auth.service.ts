import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import admin from '../../config/firebase-admin';
import { InvitationsService } from '../invitations/invitations.service';
import { getErrorMessage } from '../utils/errorMessage';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly invitationsService: InvitationsService,
  ) {}

  async validateUser(firebaseUser: any): Promise<any> {
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

  async registerUser(firebaseUser: any, body: any): Promise<any> {
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

  private async registerOwner(
    uid: string,
    email: string,
    name?: string,
    profilePhotoUrl?: string | null,
  ): Promise<any> {
    let user = this.userRepo.create({
      firebase_uid: uid,
      email,
      name: name || null,
      profile_photo_url: profilePhotoUrl || null,
      role: 'owner',
      permission_view: true,
      permission_edit: true,
      permission_delete: true,
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
  ): Promise<any> {
    const invite = await this.invitationsService.validateInviteForRegister(
      inviteToken,
      email,
    );

    let member = this.userRepo.create({
      firebase_uid: uid,
      email,
      name: name || null,
      profile_photo_url: profilePhotoUrl || null,
      role: 'member',
      permission_view: true,
      permission_edit: false,
      permission_delete: false,
    });

    member = await this.userRepo.save(member);

    const inviteResult =
      await this.invitationsService.completeInviteForRegisteredUser(
        invite,
        member,
      );
    member.role = inviteResult.role as 'owner' | 'member';
    member.family_owner_id = inviteResult.family_owner_id;

    await this.userRepo.save(member);

    return this.buildAuthResponse(member);
  }

  private async buildAuthResponse(user: User) {
    const payload = await this.authPayload(user);
    await this.syncFirebaseClaims(user, payload.is_subscribed);
    return payload;
  }

  private async authPayload(user: User) {
    const isSubscribed = await this.getEffectiveSubscription(user);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profile_photo_url: user.profile_photo_url,
      role: user.role,
      family_owner_id: user.family_owner_id,
      is_subscribed: isSubscribed,
    };
  }

  private async getEffectiveSubscription(user: User): Promise<boolean> {
    if (user.role === 'owner') {
      return Boolean(user.is_subscribed);
    }

    if (!user.family_owner_id) {
      return false;
    }

    const owner = await this.userRepo.findOne({
      where: { id: user.family_owner_id, role: 'owner' },
    });

    return Boolean(owner?.is_subscribed);
  }

  private async ensureOwnerFamilyId(user: User) {
    if (user.role === 'owner' && !user.family_owner_id) {
      user.family_owner_id = user.id;
      await this.userRepo.save(user);
    }
  }

  private async syncFirebaseClaims(
    user: User,
    effectiveSubscription: boolean,
  ): Promise<void> {
    try {
      const userRecord = await admin.auth().getUser(user.firebase_uid);

      const nextClaims = {
        ...(userRecord.customClaims || {}),
        role: user.role,
        is_subscribed: Boolean(effectiveSubscription),
        ...(user.name && { name: user.name }),
        ...(user.profile_photo_url && { profile_photo_url: user.profile_photo_url }),
      };

      await admin.auth().setCustomUserClaims(user.firebase_uid, nextClaims);

      if (
        (user.name && userRecord.displayName !== user.name) ||
        (user.profile_photo_url && userRecord.photoURL !== user.profile_photo_url)
      ) {
        await admin.auth().updateUser(user.firebase_uid, {
          ...(user.name ? { displayName: user.name } : {}),
          ...(user.profile_photo_url ? { photoURL: user.profile_photo_url } : {}),
        });
      }
    } catch (error) {
      console.error('Failed to sync Firebase claims:', {
        uid: user.firebase_uid,
        message: getErrorMessage(error),
      });
    }
  }
}
