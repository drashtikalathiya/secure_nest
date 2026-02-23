import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { getErrorMessage } from '../utils/errorMessage';
import { sendError, sendSuccess } from '../utils/responseHandler';
import { ContactsService } from './contacts.service';
import type { AuthenticatedRequest } from '../auth/dto/auth.dto';
import type { ContactPayloadDto } from './dto/contacts.dto';

@Controller('contacts')
@UseGuards(FirebaseAuthGuard)
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Get()
  async getContacts(@Req() req: AuthenticatedRequest) {
    try {
      const contacts = await this.contactsService.getContacts(req.user.uid);
      return sendSuccess('Contacts fetched successfully', contacts);
    } catch (error) {
      return sendError('Failed to fetch contacts', getErrorMessage(error));
    }
  }

  @Post()
  async createContact(
    @Req() req: AuthenticatedRequest,
    @Body() body: ContactPayloadDto,
  ) {
    try {
      const contact = await this.contactsService.createContact(
        req.user.uid,
        body,
      );
      return sendSuccess('Contact created successfully', contact);
    } catch (error) {
      return sendError('Failed to create contact', getErrorMessage(error));
    }
  }

  @Patch(':id')
  async updateContact(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: ContactPayloadDto,
  ) {
    try {
      const contact = await this.contactsService.updateContact(
        req.user.uid,
        id,
        body,
      );
      return sendSuccess('Contact updated successfully', contact);
    } catch (error) {
      return sendError('Failed to update contact', getErrorMessage(error));
    }
  }

  @Delete(':id')
  async deleteContact(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    try {
      await this.contactsService.deleteContact(req.user.uid, id);
      return sendSuccess('Contact deleted successfully', null);
    } catch (error) {
      return sendError('Failed to delete contact', getErrorMessage(error));
    }
  }
}
