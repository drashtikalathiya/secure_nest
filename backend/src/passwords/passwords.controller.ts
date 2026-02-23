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
import { PasswordsService } from './passwords.service';
import type { AuthenticatedRequest } from '../auth/dto/auth.dto';
import type { CreatePasswordDto, UpdatePasswordDto } from './dto/passwords.dto';

@Controller('passwords')
@UseGuards(FirebaseAuthGuard)
export class PasswordsController {
  constructor(private passwordsService: PasswordsService) {}

  @Get()
  async getPasswords(@Req() req: AuthenticatedRequest) {
    try {
      const passwords = await this.passwordsService.getPasswords(req.user.uid);
      return sendSuccess('Passwords fetched successfully', passwords);
    } catch (error) {
      return sendError('Failed to fetch passwords', getErrorMessage(error));
    }
  }

  @Post()
  async createPassword(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreatePasswordDto,
  ) {
    try {
      const created = await this.passwordsService.createPassword(
        req.user.uid,
        body,
      );
      return sendSuccess('Password created successfully', created);
    } catch (error) {
      return sendError('Failed to create password', getErrorMessage(error));
    }
  }

  @Patch(':id')
  async updatePassword(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdatePasswordDto,
  ) {
    try {
      const updated = await this.passwordsService.updatePassword(
        req.user.uid,
        id,
        body,
      );
      return sendSuccess('Password updated successfully', updated);
    } catch (error) {
      return sendError('Failed to update password', getErrorMessage(error));
    }
  }

  @Delete(':id')
  async deletePassword(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    try {
      await this.passwordsService.deletePassword(req.user.uid, id);
      return sendSuccess('Password deleted successfully', null);
    } catch (error) {
      return sendError('Failed to delete password', getErrorMessage(error));
    }
  }
}
