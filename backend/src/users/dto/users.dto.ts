import type { AccessLevel } from '../../permissions/permission-profile.entity';
import type { PermissionPayloadInput } from '../../permissions/dto/permissions.dto';
import type { User } from '../user.entity';

export type UpdateMyProfileDto = {
  name?: string | null;
  profilePhotoUrl?: string | null;
};

export type UpdateMemberPermissionsDto = PermissionPayloadInput;

export type UserProfilePhotoFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
};

export type MemberResponseDto = User & {
  permission_password_access_level: AccessLevel;
  permission_contacts_access_level: AccessLevel;
  permission_documents_access_level: AccessLevel;
  permission_invite_others: boolean;
  permission_export_data: boolean;
};
