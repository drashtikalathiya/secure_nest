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

export type RecentDocumentItemDto = {
  id: string;
  title: string;
  file_name: string | null;
  category: string | null;
  file_type: string | null;
  file_url: string | null;
  size_mb: number | null;
  visibility: DocumentVisibility;
  shared_with_user_ids: string[] | null;
  created_at: Date;
  created_by_user_id: string;
  folder_id: string;
  folder_name: string | null;
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
