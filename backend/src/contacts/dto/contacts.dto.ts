import type { Contact } from './contact.entity';

export type ContactPermissionsDto = {
  view: boolean;
  edit: boolean;
  delete: boolean;
};

export type ContactListResponseDto = {
  items: Contact[];
  permissions: ContactPermissionsDto;
};

export type ContactPayloadDto = {
  name?: string | null;
  relationship?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  category?: string | null;
  website?: string | null;
};
