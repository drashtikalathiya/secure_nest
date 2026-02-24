import type { DocumentFolder } from '../document-folder.entity';

export type DocumentVisibility = 'private' | 'family' | 'specific';

export type DocumentPermissionsDto = {
  view: boolean;
  edit: boolean;
  delete: boolean;
};

export type DocumentListResponseDto = {
  folders: DocumentFolder[];
  permissions: DocumentPermissionsDto;
};

export type CreateFolderDto = {
  name?: string | null;
  visibility?: DocumentVisibility | null;
  sharedWith?: string[] | null;
};

export type UpdateFolderDto = {
  name?: string | null;
  visibility?: DocumentVisibility | null;
  sharedWith?: string[] | null;
};

export type CreateDocumentDto = {
  title?: string | null;
  folderId?: string | null;
  category?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  sizeMb?: number | null;
  visibility?: DocumentVisibility | null;
  sharedWith?: string[] | null;
};

export type UpdateDocumentDto = {
  title?: string | null;
  folderId?: string | null;
  category?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  sizeMb?: number | null;
  visibility?: DocumentVisibility | null;
  sharedWith?: string[] | null;
};
