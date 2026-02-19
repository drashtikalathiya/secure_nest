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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly invitationsService: InvitationsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadSignupProfilePhoto(
    firebaseUser: any,
    file?: { buffer: Buffer; mimetype: string; size: number },
  ): Promise<string> {
    this.validateProfilePhoto(file);

    const firebaseUid =
      typeof firebaseUser?.uid === 'string' ? firebaseUser.uid.trim() : '';
    if (!firebaseUid) {
      throw new BadRequestException('Invalid firebase user.');
    }

    try {
      return await this.cloudinaryService.uploadProfilePhoto(file!, firebaseUid);
    } catch (error) {
      throw new InternalServerErrorException(
        this.getSafeErrorMessage(error, 'Failed to upload profile photo.'),
      );
    }
  }

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
      subscription_plan: 'small',
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
    await this.syncFirebaseClaims(user, payload.is_subscribed, payload.subscription_plan);
    return payload;
  }

  private async authPayload(user: User) {
    const owner = await this.getOwnerForUser(user);
    const isSubscribed = user.role === 'owner'
      ? Boolean(user.is_subscribed)
      : Boolean(owner?.is_subscribed);
    const subscriptionPlan = owner?.subscription_plan || user.subscription_plan || 'small';

    if (
      user.role === 'member' &&
      user.subscription_plan !== subscriptionPlan
    ) {
      await this.userRepo.update(user.id, {
        subscription_plan: subscriptionPlan,
      });
      user.subscription_plan = subscriptionPlan;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profile_photo_url: user.profile_photo_url,
      role: user.role,
      family_owner_id: user.family_owner_id,
      is_subscribed: isSubscribed,
      subscription_plan: subscriptionPlan,
    };
  }

  private async getOwnerForUser(user: User): Promise<User | null> {
    if (user.role === 'owner') {
      return user;
    }

    if (!user.family_owner_id) {
      return null;
    }

    return this.userRepo.findOne({
      where: { id: user.family_owner_id, role: 'owner' },
    });
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
    subscriptionPlan: 'small' | 'family',
  ): Promise<void> {
    try {
      const userRecord = await admin.auth().getUser(user.firebase_uid);

      const nextClaims = {
        ...(userRecord.customClaims || {}),
        role: user.role,
        is_subscribed: Boolean(effectiveSubscription),
        subscription_plan: subscriptionPlan,
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

  private validateProfilePhoto(
    file?: { mimetype: string; size: number },
  ): void {
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
