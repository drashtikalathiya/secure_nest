import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { getErrorMessage } from '../utils/errorMessage';
import { sendError, sendSuccess } from '../utils/responseHandler';
import { DocumentsService } from './documents.service';
import type { AuthenticatedRequest } from '../auth/dto/auth.dto';
import type {
  CreateDocumentDto,
  CreateFolderDto,
  UpdateFolderDto,
  UpdateDocumentDto,
} from './dto/documents.dto';

const MAX_DOCUMENT_FILE_BYTES = 25 * 1024 * 1024;

const parseSharedWith = (value: unknown): string[] | null => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const normalizeDocumentBody = (
  body: CreateDocumentDto | UpdateDocumentDto,
): CreateDocumentDto | UpdateDocumentDto => {
  const sharedWith = parseSharedWith(body?.sharedWith);
  const sizeMb =
    typeof body?.sizeMb === 'string' ? Number(body.sizeMb) : body?.sizeMb;

  return {
    ...body,
    sharedWith,
    sizeMb,
  };
};

@Controller('documents')
@UseGuards(FirebaseAuthGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  async getDocuments(@Req() req: AuthenticatedRequest) {
    try {
      const documents = await this.documentsService.getDocuments(req.user.uid);
      return sendSuccess('Documents fetched successfully', documents);
    } catch (error) {
      return sendError('Failed to fetch documents', getErrorMessage(error));
    }
  }

  @Post('folders')
  async createFolder(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateFolderDto,
  ) {
    try {
      const created = await this.documentsService.createFolder(
        req.user.uid,
        body,
      );
      return sendSuccess('Folder created successfully', created);
    } catch (error) {
      return sendError('Failed to create folder', getErrorMessage(error));
    }
  }

  @Delete('folders/:id')
  async deleteFolder(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    try {
      await this.documentsService.deleteFolder(req.user.uid, id);
      return sendSuccess('Folder deleted successfully', null);
    } catch (error) {
      return sendError('Failed to delete folder', getErrorMessage(error));
    }
  }

  @Patch('folders/:id')
  async updateFolder(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateFolderDto,
  ) {
    try {
      const updated = await this.documentsService.updateFolder(
        req.user.uid,
        id,
        body,
      );
      return sendSuccess('Folder updated successfully', updated);
    } catch (error) {
      return sendError('Failed to update folder', getErrorMessage(error));
    }
  }

  @Post('files')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_DOCUMENT_FILE_BYTES } }),
  )
  async createDocument(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateDocumentDto,
    @UploadedFile()
    file: { buffer: Buffer; mimetype: string; originalname: string; size: number },
  ) {
    try {
      const created = await this.documentsService.createDocument(
        req.user.uid,
        normalizeDocumentBody(body) as CreateDocumentDto,
        file,
      );
      return sendSuccess('Document created successfully', created);
    } catch (error) {
      return sendError('Failed to create document', getErrorMessage(error));
    }
  }

  @Patch('files/:id')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_DOCUMENT_FILE_BYTES } }),
  )
  async updateDocument(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateDocumentDto,
    @UploadedFile()
    file: { buffer: Buffer; mimetype: string; originalname: string; size: number },
  ) {
    try {
      const updated = await this.documentsService.updateDocument(
        req.user.uid,
        id,
        normalizeDocumentBody(body) as UpdateDocumentDto,
        file,
      );
      return sendSuccess('Document updated successfully', updated);
    } catch (error) {
      return sendError('Failed to update document', getErrorMessage(error));
    }
  }

  @Delete('files/:id')
  async deleteDocument(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    try {
      await this.documentsService.deleteDocument(req.user.uid, id);
      return sendSuccess('Document deleted successfully', null);
    } catch (error) {
      return sendError('Failed to delete document', getErrorMessage(error));
    }
  }
}
