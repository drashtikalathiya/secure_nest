import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { USER_ROLES } from '../utils/constants';
import { DocumentFolder } from './document-folder.entity';
import { DocumentFile } from './document-file.entity';
import { CloudinaryService } from '../users/cloudinary.service';
import type {
  CreateDocumentDto,
  CreateFolderDto,
  DocumentListResponseDto,
  DocumentPermissionsDto,
  RecentDocumentItemDto,
  DocumentVisibility,
  UpdateFolderDto,
  UpdateDocumentDto,
} from './dto/documents.dto';

type DocumentUploadFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

const MAX_DOCUMENT_FILE_BYTES = 25 * 1024 * 1024;
const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const RECENT_DOCUMENT_FALLBACK_TAKE = 40;

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentFolder)
    private folderRepo: Repository<DocumentFolder>,
    @InjectRepository(DocumentFile)
    private documentRepo: Repository<DocumentFile>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private permissionsService: PermissionsService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getDocuments(firebaseUid: string): Promise<DocumentListResponseDto> {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'documents',
    );
    this.ensureCanViewDocuments(permissions);

    const familyOwnerId = this.getFamilyOwnerId(requester);

    const folders = await this.folderRepo.find({
      where: { family_owner_id: familyOwnerId },
      order: { created_at: 'DESC' },
      relations: ['files'],
    });

    const visibleFolders = folders
      .filter((folder) => this.canViewFolder(folder, requester.id))
      .map((folder) => ({
        ...folder,
        files: (folder.files || [])
          .filter((file) => this.canViewDocument(file, requester.id))
          .sort((a, b) =>
            (b.created_at?.getTime?.() || 0) -
            (a.created_at?.getTime?.() || 0),
          ),
      }));

    return {
      folders: visibleFolders,
      permissions,
    };
  }

  async getRecentDocuments(
    firebaseUid: string,
    limit = 4,
  ): Promise<RecentDocumentItemDto[]> {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'documents',
    );
    this.ensureCanViewDocuments(permissions);

    const familyOwnerId = this.getFamilyOwnerId(requester);
    const take = Math.max(RECENT_DOCUMENT_FALLBACK_TAKE, limit * 4);

    const documents = await this.documentRepo.find({
      where: { family_owner_id: familyOwnerId },
      order: { created_at: 'DESC' },
      take,
      relations: ['folder'],
    });

    return documents
      .filter(
        (file) =>
          Boolean(file.folder) &&
          this.canViewFolder(file.folder as DocumentFolder, requester.id) &&
          this.canViewDocument(file, requester.id),
      )
      .slice(0, limit)
      .map((file) => ({
        id: file.id,
        title: file.title,
        file_name: file.file_name,
        category: file.category,
        file_type: file.file_type,
        file_url: file.file_url,
        size_mb: file.size_mb,
        visibility: file.visibility,
        shared_with_user_ids: file.shared_with_user_ids,
        created_at: file.created_at,
        created_by_user_id: file.created_by_user_id,
        folder_id: file.folder_id,
        folder_name: file.folder?.name ?? null,
      }));
  }

  async createFolder(
    firebaseUid: string,
    body: CreateFolderDto,
  ): Promise<DocumentFolder> {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'documents',
    );
    this.ensureCanEditDocuments(permissions);

    const familyOwnerId = this.getFamilyOwnerId(requester);

    const visibility = this.getVisibility(body?.visibility);
    const sharedWithUserIds = await this.resolveSharedUsers(
      body?.sharedWith,
      visibility,
      familyOwnerId,
      requester.id,
    );

    const folder = this.folderRepo.create({
      family_owner_id: familyOwnerId,
      created_by_user_id: requester.id,
      name: this.requireField(body?.name, 'Folder name is required.'),
      visibility,
      shared_with_user_ids:
        visibility === 'specific' && sharedWithUserIds.length
          ? sharedWithUserIds
          : null,
    });

    return this.folderRepo.save(folder);
  }

  async deleteFolder(firebaseUid: string, folderId: string): Promise<void> {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'documents',
    );
    this.ensureCanEditDocuments(permissions);

    const familyOwnerId = this.getFamilyOwnerId(requester);

    const existing = await this.folderRepo.findOne({
      where: { id: folderId, family_owner_id: familyOwnerId },
    });

    if (!existing) {
      throw new NotFoundException('Folder not found in your family.');
    }

    this.ensureCanManageFolder(existing, requester);

    await this.folderRepo.delete({ id: existing.id });
  }

  async updateFolder(
    firebaseUid: string,
    folderId: string,
    body: UpdateFolderDto,
  ): Promise<DocumentFolder> {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'documents',
    );
    this.ensureCanEditDocuments(permissions);

    const familyOwnerId = this.getFamilyOwnerId(requester);

    const existing = await this.folderRepo.findOne({
      where: { id: folderId, family_owner_id: familyOwnerId },
    });

    if (!existing) {
      throw new NotFoundException('Folder not found in your family.');
    }

    this.ensureCanManageFolder(existing, requester);

    const visibility = this.getVisibility(
      body?.visibility ?? existing.visibility,
    );
    const sharedWithUserIds = await this.resolveSharedUsers(
      body?.sharedWith ?? existing.shared_with_user_ids,
      visibility,
      familyOwnerId,
      requester.id,
    );

    const updated = await this.folderRepo.save({
      ...existing,
      name:
        body?.name !== undefined
          ? this.requireField(body?.name, 'Folder name is required.')
          : existing.name,
      visibility,
      shared_with_user_ids:
        visibility === 'specific' && sharedWithUserIds.length
          ? sharedWithUserIds
          : null,
    });

    return updated;
  }

  async createDocument(
    firebaseUid: string,
    body: CreateDocumentDto,
    file?: DocumentUploadFile,
  ): Promise<DocumentFile> {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'documents',
    );
    this.ensureCanEditDocuments(permissions);

    this.validateDocumentFile(file);

    const familyOwnerId = this.getFamilyOwnerId(requester);
    const folderId = this.requireField(body?.folderId, 'Folder is required.');

    const folder = await this.folderRepo.findOne({
      where: { id: folderId, family_owner_id: familyOwnerId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found in your family.');
    }

    if (!this.canViewFolder(folder, requester.id)) {
      throw new ForbiddenException('You cannot upload to this folder.');
    }

    const visibility = this.getVisibility(body?.visibility);
    const sharedWithUserIds = await this.resolveSharedUsers(
      body?.sharedWith,
      visibility,
      familyOwnerId,
      requester.id,
    );

    let uploadResult: {
      url: string;
      publicId: string;
      resourceType: string;
      bytes: number;
      originalFilename?: string;
      format?: string;
    };
    try {
      uploadResult = await this.cloudinaryService.uploadDocument(
        file!,
        this.buildDocumentPublicId(familyOwnerId),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        this.getErrorMessage(error, 'Failed to upload document.'),
      );
    }

    const document = this.documentRepo.create({
      family_owner_id: familyOwnerId,
      created_by_user_id: requester.id,
      folder_id: folder.id,
      title: this.requireField(body?.title, 'Document title is required.'),
      category: this.clean(body?.category),
      file_name: this.clean(file?.originalname) || this.clean(body?.fileName),
      file_type: this.clean(this.getFileType(file?.originalname)),
      file_url: uploadResult.url,
      file_public_id: uploadResult.publicId,
      file_resource_type: uploadResult.resourceType,
      file_mime_type: file?.mimetype || null,
      size_mb: this.toSizeMb(
        typeof file?.size === 'number'
          ? Number((file.size / (1024 * 1024)).toFixed(2))
          : body?.sizeMb,
      ),
      visibility,
      shared_with_user_ids:
        visibility === 'specific' && sharedWithUserIds.length
          ? sharedWithUserIds
          : null,
    });

    return this.documentRepo.save(document);
  }

  async updateDocument(
    firebaseUid: string,
    documentId: string,
    body: UpdateDocumentDto,
    file?: DocumentUploadFile,
  ): Promise<DocumentFile> {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'documents',
    );
    this.ensureCanEditDocuments(permissions);

    const familyOwnerId = this.getFamilyOwnerId(requester);

    const existing = await this.documentRepo.findOne({
      where: { id: documentId, family_owner_id: familyOwnerId },
    });

    if (!existing) {
      throw new NotFoundException('Document not found in your family.');
    }

    if (existing.created_by_user_id !== requester.id) {
      throw new ForbiddenException('Only the creator can edit this document.');
    }

    let nextFolderId = existing.folder_id;
    if (body?.folderId && body.folderId !== existing.folder_id) {
      const nextFolder = await this.folderRepo.findOne({
        where: { id: body.folderId, family_owner_id: familyOwnerId },
      });
      if (!nextFolder) {
        throw new NotFoundException('Destination folder not found.');
      }
      if (!this.canViewFolder(nextFolder, requester.id)) {
        throw new ForbiddenException('You cannot move to this folder.');
      }
      nextFolderId = nextFolder.id;
    }

    const visibility = this.getVisibility(
      body?.visibility ?? existing.visibility,
    );
    const sharedWithUserIds = await this.resolveSharedUsers(
      body?.sharedWith ?? existing.shared_with_user_ids,
      visibility,
      familyOwnerId,
      requester.id,
    );

    let nextFileName = existing.file_name;
    let nextFileType = existing.file_type;
    let nextFileUrl = existing.file_url;
    let nextFilePublicId = existing.file_public_id;
    let nextFileResourceType = existing.file_resource_type;
    let nextFileMimeType = existing.file_mime_type;
    let nextSizeMb = existing.size_mb;

    if (file) {
      this.validateDocumentFile(file);

      let uploadResult: {
        url: string;
        publicId: string;
        resourceType: string;
        bytes: number;
        originalFilename?: string;
        format?: string;
      };
      try {
        uploadResult = await this.cloudinaryService.uploadDocument(
          file,
          this.buildDocumentPublicId(familyOwnerId),
        );
      } catch (error) {
        throw new InternalServerErrorException(
          this.getErrorMessage(error, 'Failed to upload document.'),
        );
      }

      if (existing.file_public_id && existing.file_resource_type) {
        try {
          await this.cloudinaryService.deleteAsset(
            existing.file_public_id,
            existing.file_resource_type,
          );
        } catch (error) {
          throw new InternalServerErrorException(
            this.getErrorMessage(error, 'Failed to replace document.'),
          );
        }
      }

      nextFileName = file.originalname;
      nextFileType = this.getFileType(file.originalname);
      nextFileUrl = uploadResult.url;
      nextFilePublicId = uploadResult.publicId;
      nextFileResourceType = uploadResult.resourceType;
      nextFileMimeType = file.mimetype;
      nextSizeMb = this.toSizeMb(
        typeof file.size === 'number'
          ? Number((file.size / (1024 * 1024)).toFixed(2))
          : existing.size_mb,
      );
    }

    const updated = await this.documentRepo.save({
      ...existing,
      folder_id: nextFolderId,
      title:
        body?.title !== undefined
          ? this.requireField(body?.title, 'Document title is required.')
          : existing.title,
      category:
        body?.category !== undefined
          ? this.clean(body?.category)
          : existing.category,
      file_name:
        body?.fileName !== undefined ? this.clean(body?.fileName) : nextFileName,
      file_type:
        body?.fileType !== undefined ? this.clean(body?.fileType) : nextFileType,
      file_url: nextFileUrl,
      file_public_id: nextFilePublicId,
      file_resource_type: nextFileResourceType,
      file_mime_type: nextFileMimeType,
      size_mb:
        body?.sizeMb !== undefined ? this.toSizeMb(body?.sizeMb) : nextSizeMb,
      visibility,
      shared_with_user_ids:
        visibility === 'specific' && sharedWithUserIds.length
          ? sharedWithUserIds
          : null,
    });

    return updated;
  }

  async deleteDocument(firebaseUid: string, documentId: string): Promise<void> {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'documents',
    );
    this.ensureCanEditDocuments(permissions);

    const familyOwnerId = this.getFamilyOwnerId(requester);

    const existing = await this.documentRepo.findOne({
      where: { id: documentId, family_owner_id: familyOwnerId },
    });

    if (!existing) {
      throw new NotFoundException('Document not found in your family.');
    }

    if (existing.created_by_user_id !== requester.id) {
      throw new ForbiddenException(
        'Only the creator can delete this document.',
      );
    }

    if (existing.file_public_id && existing.file_resource_type) {
      try {
        await this.cloudinaryService.deleteAsset(
          existing.file_public_id,
          existing.file_resource_type,
        );
      } catch (error) {
        throw new InternalServerErrorException(
          this.getErrorMessage(error, 'Failed to delete document file.'),
        );
      }
    }

    await this.documentRepo.delete({ id: existing.id });
  }

  private async resolveSharedUsers(
    input: unknown,
    visibility: DocumentVisibility,
    familyOwnerId: string,
    requesterId: string,
  ): Promise<string[]> {
    if (visibility !== 'specific') {
      return [];
    }

    if (!Array.isArray(input)) {
      return [];
    }

    const normalized = Array.from(
      new Set(
        input.filter((id) => typeof id === 'string').map((id) => id.trim()),
      ),
    ).filter(Boolean);

    if (!normalized.length) {
      return [];
    }

    const familyUsers = await this.userRepo.find({
      where: [
        { id: familyOwnerId, role: USER_ROLES.OWNER },
        { family_owner_id: familyOwnerId, role: USER_ROLES.MEMBER },
      ],
      select: ['id'],
    });

    const familyUserIdSet = new Set(familyUsers.map((user) => user.id));

    return normalized.filter(
      (id) => familyUserIdSet.has(id) && id !== requesterId,
    );
  }

  private canViewFolder(folder: DocumentFolder, requesterId: string): boolean {
    if (folder.created_by_user_id === requesterId) {
      return true;
    }

    if (folder.visibility === 'family') {
      return true;
    }

    if (folder.visibility === 'specific') {
      const sharedWith = folder.shared_with_user_ids || [];
      return sharedWith.includes(requesterId);
    }

    return false;
  }

  private canViewDocument(file: DocumentFile, requesterId: string): boolean {
    if (file.created_by_user_id === requesterId) {
      return true;
    }

    if (file.visibility === 'family') {
      return true;
    }

    if (file.visibility === 'specific') {
      const sharedWith = file.shared_with_user_ids || [];
      return sharedWith.includes(requesterId);
    }

    return false;
  }

  private getVisibility(value: unknown): DocumentVisibility {
    if (value === 'private' || value === 'specific') {
      return value;
    }

    return 'family';
  }

  private async getRequester(firebaseUid: string): Promise<User> {
    const requester = await this.userRepo.findOne({
      where: { firebase_uid: firebaseUid },
    });

    if (!requester) {
      throw new NotFoundException('User account was not found.');
    }

    return requester;
  }

  private ensureCanViewDocuments(permissions: DocumentPermissionsDto): void {
    if (!permissions.view) {
      throw new ForbiddenException(
        'You do not have permission to view documents.',
      );
    }
  }

  private ensureCanEditDocuments(permissions: DocumentPermissionsDto): void {
    if (!permissions.edit) {
      throw new ForbiddenException(
        'You do not have permission to edit documents.',
      );
    }
  }

  private ensureCanManageFolder(folder: DocumentFolder, user: User): void {
    if (folder.created_by_user_id !== user.id) {
      throw new ForbiddenException('Only the creator can manage this folder.');
    }
  }

  private getFamilyOwnerId(user: User): string {
    if (user.role === USER_ROLES.OWNER) return user.id;

    if (!user.family_owner_id) {
      throw new ForbiddenException(
        'Family owner was not found for this account.',
      );
    }

    return user.family_owner_id;
  }

  private toSizeMb(value: unknown): number {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return 0;
    }

    return Math.max(0, value);
  }

  private clean(value: unknown): string | null {
    if (typeof value !== 'string') return null;

    const trimmed = value.trim();
    return trimmed || null;
  }

  private validateDocumentFile(file?: DocumentUploadFile): void {
    if (!file) {
      throw new BadRequestException('Document file is required.');
    }

    if (!ALLOWED_DOCUMENT_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Unsupported document file type.');
    }

    if (typeof file.size !== 'number' || file.size <= 0) {
      throw new BadRequestException('Document file is invalid.');
    }

    if (file.size > MAX_DOCUMENT_FILE_BYTES) {
      throw new BadRequestException('Document file must be 25MB or smaller.');
    }
  }

  private buildDocumentPublicId(familyOwnerId: string): string {
    return `secureNest/documents/${familyOwnerId}/${randomUUID()}`;
  }

  private getFileType(fileName?: string | null): string | null {
    if (!fileName) return null;
    const extension = fileName.split('.').pop()?.toUpperCase();
    if (!extension) return null;
    if (['JPG', 'JPEG', 'PNG'].includes(extension)) return 'IMAGE';
    if (extension === 'DOC') return 'DOC';
    if (extension === 'DOCX') return 'DOCX';
    if (extension === 'PDF') return 'PDF';
    return extension;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message || fallback;
    }
    return fallback;
  }

  private requireField(value: unknown, message: string): string {
    if (typeof value !== 'string') {
      throw new BadRequestException(message);
    }

    const trimmed = value.trim();
    if (!trimmed) {
      throw new BadRequestException(message);
    }

    return trimmed;
  }
}
