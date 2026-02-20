import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { PermissionProfile } from './permission-profile.entity';
import {
  DEFAULT_MEMBER_PERMISSIONS,
  OWNER_PERMISSIONS,
  PermissionPayload,
  normalizePermissionPayload,
  payloadToProfileFields,
  profileToPayload,
} from './permissions.utils';

type PermissionModule = 'passwords' | 'contacts' | 'documents';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionProfile)
    private permissionProfileRepo: Repository<PermissionProfile>,
  ) {}

  async resolveUserPayload(user: Pick<User, 'role' | 'permission_profile_id'>) {
    if (user.role === 'owner') {
      return OWNER_PERMISSIONS;
    }

    return this.getPayloadByProfileId(user.permission_profile_id);
  }

  async getPayloadByProfileId(
    profileId?: string | null,
    fallback: PermissionPayload = DEFAULT_MEMBER_PERMISSIONS,
  ): Promise<PermissionPayload> {
    if (!profileId) {
      return fallback;
    }

    const profile = await this.permissionProfileRepo.findOne({
      where: { id: profileId },
    });

    return profileToPayload(profile, fallback);
  }

  async createProfile(
    ownerId: string,
    input: any,
    fallback: PermissionPayload = DEFAULT_MEMBER_PERMISSIONS,
  ): Promise<string> {
    const payload = normalizePermissionPayload(input, fallback);
    const profile = await this.permissionProfileRepo.save(
      this.permissionProfileRepo.create({
        owner_id: ownerId,
        ...payloadToProfileFields(payload),
      }),
    );

    return profile.id;
  }

  async upsertProfile(
    ownerId: string,
    profileId: string | null | undefined,
    input: any,
    fallback: PermissionPayload = DEFAULT_MEMBER_PERMISSIONS,
  ): Promise<string> {
    const existing = profileId
      ? await this.permissionProfileRepo.findOne({ where: { id: profileId } })
      : null;

    const currentPayload = profileToPayload(existing, fallback);
    const nextPayload = normalizePermissionPayload(input, currentPayload);

    if (existing) {
      await this.permissionProfileRepo.update(
        { id: existing.id },
        payloadToProfileFields(nextPayload),
      );
      return existing.id;
    }

    const created = await this.permissionProfileRepo.save(
      this.permissionProfileRepo.create({
        owner_id: ownerId,
        ...payloadToProfileFields(nextPayload),
      }),
    );
    return created.id;
  }

  async getModuleCrudPermissions(
    user: Pick<User, 'role' | 'permission_profile_id'>,
    module: PermissionModule,
  ) {
    const payload = await this.resolveUserPayload(user);
    const access =
      module === 'passwords'
        ? payload.passwordAccess
        : module === 'contacts'
          ? payload.contactsAccess
          : payload.documentsAccess;

    const canEdit = access === 'edit';
    const canView = canEdit || access === 'view';
    return { view: canView, edit: canEdit, delete: canEdit };
  }

  toApiPermissionFields(payload: PermissionPayload) {
    return {
      permission_password_access_level: payload.passwordAccess,
      permission_contacts_access_level: payload.contactsAccess,
      permission_documents_access_level: payload.documentsAccess,
      permission_invite_others: payload.inviteOthers,
      permission_export_data: payload.exportData,
    };
  }
}
