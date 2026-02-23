import type { PermissionPayloadInput } from '../../permissions/dto/permissions.dto';
import type { UserRole } from '../../utils/constants';

export type CreateInvitationDto = PermissionPayloadInput & {
  email?: string | null;
  role?: UserRole | null;
};
