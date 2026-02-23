import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import admin from '../../config/firebase-admin';
import { Invitation } from '../invitations/invitation.entity';
import { User } from './user.entity';
import { CloudinaryService } from './cloudinary.service';
import { PermissionsService } from '../permissions/permissions.service';
import { USER_ROLES } from '../utils/constants';
import type {
  MemberResponseDto,
  UpdateMemberPermissionsDto,
  UpdateMyProfileDto,
  UserProfilePhotoFile,
} from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Invitation)
    private inviteRepo: Repository<Invitation>,
    private permissionsService: PermissionsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      order: { created_at: 'DESC' },
    });
  }

  async findFamilyMembers(firebaseUid: string): Promise<MemberResponseDto[]> {
    const requester = await this.userRepo.findOne({
      where: { firebase_uid: firebaseUid },
    });

    if (!requester) {
      throw new NotFoundException('User account was not found.');
    }

    const familyOwnerId =
      requester.role === USER_ROLES.OWNER
        ? requester.id
        : requester.family_owner_id;

    if (!familyOwnerId) {
      return [await this.toMemberResponse(requester)];
    }

    const users = await this.userRepo.find({
      where: [
        { id: familyOwnerId, role: USER_ROLES.OWNER },
        { family_owner_id: familyOwnerId, role: USER_ROLES.MEMBER },
      ],
      order: { created_at: 'ASC' },
    });

    const sorted = users.sort((a, b) => {
      if (a.role === b.role) return 0;
      return a.role === USER_ROLES.OWNER ? -1 : 1;
    });

    return Promise.all(sorted.map((user) => this.toMemberResponse(user)));
  }

  async uploadMyProfilePhoto(
    firebaseUid: string,
    file?: UserProfilePhotoFile,
  ): Promise<User> {
    const requester = await this.findByFirebaseUidOrThrow(firebaseUid);

    this.validateProfilePhoto(file);

    let nextPhotoUrl: string;
    try {
      nextPhotoUrl = await this.cloudinaryService.uploadProfilePhoto(
        file!,
        requester.firebase_uid,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        this.getErrorMessage(error, 'Failed to upload profile photo.'),
      );
    }

    await this.syncProfile(requester, requester.name, nextPhotoUrl);

    return this.findByIdOrThrow(requester.id);
  }

  async removeMyProfilePhoto(firebaseUid: string): Promise<User> {
    const requester = await this.findByFirebaseUidOrThrow(firebaseUid);

    if (requester.profile_photo_url) {
      try {
        await this.cloudinaryService.deleteProfilePhotoByKey(
          requester.firebase_uid,
        );

        // Clean up legacy URLs that may have used a different public ID.
        await this.cloudinaryService.deleteByUrl(requester.profile_photo_url);
      } catch (error) {
        throw new InternalServerErrorException(
          this.getErrorMessage(error, 'Failed to remove profile photo.'),
        );
      }
    }

    await this.syncProfile(requester, requester.name, null);

    return this.findByIdOrThrow(requester.id);
  }

  async updateMyProfile(
    firebaseUid: string,
    body: UpdateMyProfileDto,
  ): Promise<User> {
    const requester = await this.findByFirebaseUidOrThrow(firebaseUid);

    const nextName =
      body?.name !== undefined
        ? this.requireField(body?.name, 'Name is required.')
        : requester.name;
    const nextPhotoUrl =
      body?.profilePhotoUrl !== undefined
        ? this.cleanNullable(body?.profilePhotoUrl)
        : requester.profile_photo_url;

    if (body?.profilePhotoUrl === null && requester.profile_photo_url) {
      try {
        await this.cloudinaryService.deleteProfilePhotoByKey(
          requester.firebase_uid,
        );
        await this.cloudinaryService.deleteByUrl(requester.profile_photo_url);
      } catch (error) {
        throw new InternalServerErrorException(
          this.getErrorMessage(error, 'Failed to remove profile photo.'),
        );
      }
    }

    await this.syncProfile(requester, nextName, nextPhotoUrl);

    return this.findByIdOrThrow(requester.id);
  }

  async updateMemberPermissions(
    firebaseUid: string,
    memberId: string,
    body: UpdateMemberPermissionsDto,
  ): Promise<MemberResponseDto> {
    const requester = await this.userRepo.findOne({
      where: { firebase_uid: firebaseUid },
    });

    if (!requester) {
      throw new NotFoundException('User account was not found.');
    }

    if (requester.role !== USER_ROLES.OWNER) {
      throw new ForbiddenException('Only an owner can update permissions.');
    }

    const member = await this.userRepo.findOne({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member account was not found.');
    }

    if (member.family_owner_id !== requester.id) {
      throw new ForbiddenException(
        'You can update permissions only for users in your family.',
      );
    }

    if (member.role !== USER_ROLES.MEMBER) {
      throw new BadRequestException(
        'Permissions can be updated only for members.',
      );
    }

    const profileId = await this.permissionsService.upsertProfile(
      requester.id,
      member.permission_profile_id,
      body,
    );
    if (member.permission_profile_id !== profileId) {
      await this.userRepo.update(
        { id: member.id },
        { permission_profile_id: profileId },
      );
    }

    const updatedMember = await this.userRepo.findOne({
      where: { id: member.id },
    });
    if (!updatedMember) {
      throw new NotFoundException('Member account was not found.');
    }

    return this.toMemberResponse(updatedMember);
  }

  async deleteFamilyMember(
    firebaseUid: string,
    memberId: string,
  ): Promise<void> {
    const requester = await this.userRepo.findOne({
      where: { firebase_uid: firebaseUid },
    });

    if (!requester) {
      throw new NotFoundException('User account was not found.');
    }

    if (requester.role !== USER_ROLES.OWNER) {
      throw new ForbiddenException('Only an owner can delete members.');
    }

    if (requester.id === memberId) {
      throw new ForbiddenException('Owner cannot delete their own account.');
    }

    const member = await this.userRepo.findOne({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member account was not found.');
    }

    if (member.family_owner_id !== requester.id) {
      throw new ForbiddenException(
        'You can delete only members in your family.',
      );
    }

    if (member.firebase_uid) {
      try {
        await admin.auth().deleteUser(member.firebase_uid);
      } catch (error: unknown) {
        const errorCode =
          typeof error === 'object' && error !== null && 'code' in error
            ? (error as { code?: string }).code
            : undefined;
        if (errorCode !== 'auth/user-not-found') {
          throw new InternalServerErrorException(
            'Failed to delete member from Firebase.',
          );
        }
      }
    }

    await this.inviteRepo.delete({
      owner_id: requester.id,
      email: member.email,
    });

    await this.userRepo.delete({ id: member.id });
  }

  private async findByFirebaseUidOrThrow(firebaseUid: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { firebase_uid: firebaseUid },
    });

    if (!user) {
      throw new NotFoundException('User account was not found.');
    }

    return user;
  }

  private async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User account was not found.');
    }

    return user;
  }

  private async syncProfile(
    user: User,
    nextName: string | null,
    nextPhotoUrl: string | null,
  ): Promise<void> {
    try {
      await admin.auth().updateUser(user.firebase_uid, {
        ...(nextName ? { displayName: nextName } : {}),
        ...(nextPhotoUrl ? { photoURL: nextPhotoUrl } : { photoURL: null }),
      });
    } catch {
      throw new InternalServerErrorException(
        'Failed to sync profile with Firebase.',
      );
    }

    await this.userRepo.update(
      { id: user.id },
      {
        name: nextName,
        profile_photo_url: nextPhotoUrl,
      },
    );
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

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  }

  private cleanNullable(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed || null;
  }

  private requireField(value: unknown, message: string): string {
    const cleaned = this.cleanNullable(value);
    if (!cleaned) {
      throw new BadRequestException(message);
    }

    return cleaned;
  }

  private async toMemberResponse(user: User): Promise<MemberResponseDto> {
    const permissions = await this.permissionsService.resolveUserPayload(user);

    return {
      ...user,
      ...this.permissionsService.toApiPermissionFields(permissions),
    };
  }
}
