import type { PasswordRecord } from './password.entity';

export type PasswordVisibility = 'private' | 'family' | 'specific';

export type PasswordPermissionsDto = {
  view: boolean;
  edit: boolean;
  delete: boolean;
};

export type PasswordListResponseDto = {
  items: PasswordRecord[];
  permissions: PasswordPermissionsDto;
};

export type CreatePasswordDto = {
  name?: string;
  websiteUrl?: string | null;
  category?: string | null;
  value?: string;
  password?: string;
  visibility?: PasswordVisibility;
  sharedWith?: string[] | null;
};

export type UpdatePasswordDto = CreatePasswordDto;
