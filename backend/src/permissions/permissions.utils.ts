import { AccessLevel, PermissionProfile } from './permission-profile.entity';
import type { PermissionPayloadInput } from './dto/permissions.dto';

export type PermissionPayload = {
  passwordAccess: AccessLevel;
  contactsAccess: AccessLevel;
  documentsAccess: AccessLevel;
  inviteOthers: boolean;
  exportData: boolean;
};

export const DEFAULT_MEMBER_PERMISSIONS: PermissionPayload = {
  passwordAccess: 'view',
  contactsAccess: 'view',
  documentsAccess: 'view',
  inviteOthers: false,
  exportData: true,
};

export const OWNER_PERMISSIONS: PermissionPayload = {
  passwordAccess: 'edit',
  contactsAccess: 'edit',
  documentsAccess: 'edit',
  inviteOthers: true,
  exportData: true,
};

export function resolveAccessLevel(
  incoming: unknown,
  fallback: AccessLevel = 'none',
): AccessLevel {
  if (incoming === 'none' || incoming === 'view' || incoming === 'edit') {
    return incoming;
  }

  if (typeof incoming === 'boolean') {
    return incoming ? 'edit' : 'none';
  }

  return fallback;
}

export function normalizePermissionPayload(
  input: PermissionPayloadInput | null | undefined,
  fallback: PermissionPayload = DEFAULT_MEMBER_PERMISSIONS,
): PermissionPayload {
  return {
    passwordAccess: resolveAccessLevel(
      input?.passwordAccess,
      fallback.passwordAccess,
    ),
    contactsAccess: resolveAccessLevel(
      input?.contactsAccess,
      fallback.contactsAccess,
    ),
    documentsAccess: resolveAccessLevel(
      input?.documentsAccess,
      fallback.documentsAccess,
    ),
    inviteOthers:
      typeof input?.inviteOthers === 'boolean'
        ? input.inviteOthers
        : fallback.inviteOthers,
    exportData:
      typeof input?.exportData === 'boolean'
        ? input.exportData
        : fallback.exportData,
  };
}

export function profileToPayload(
  profile?: PermissionProfile | null,
  fallback: PermissionPayload = DEFAULT_MEMBER_PERMISSIONS,
): PermissionPayload {
  if (!profile) return fallback;

  return {
    passwordAccess: resolveAccessLevel(
      profile.password_access_level,
      fallback.passwordAccess,
    ),
    contactsAccess: resolveAccessLevel(
      profile.contacts_access_level,
      fallback.contactsAccess,
    ),
    documentsAccess: resolveAccessLevel(
      profile.documents_access_level,
      fallback.documentsAccess,
    ),
    inviteOthers: Boolean(profile.invite_others),
    exportData:
      typeof profile.export_data === 'boolean'
        ? profile.export_data
        : fallback.exportData,
  };
}

export function payloadToProfileFields(payload: PermissionPayload) {
  return {
    password_access_level: payload.passwordAccess,
    contacts_access_level: payload.contactsAccess,
    documents_access_level: payload.documentsAccess,
    invite_others: payload.inviteOthers,
    export_data: payload.exportData,
  };
}
