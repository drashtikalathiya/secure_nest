import type { AccessLevel } from './permission-profile.entity';

export type PermissionModule = 'passwords' | 'contacts' | 'documents';

export type PermissionPayloadInput = {
  passwordAccess?: AccessLevel | boolean;
  contactsAccess?: AccessLevel | boolean;
  documentsAccess?: AccessLevel | boolean;
  inviteOthers?: boolean;
  exportData?: boolean;
};
