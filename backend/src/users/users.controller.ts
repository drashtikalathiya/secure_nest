import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UsersService } from './users.service';
import { sendError, sendSuccess } from '../utils/responseHandler';
import { getErrorMessage } from '../utils/errorMessage';
import type { AuthenticatedRequest } from '../auth/dto/auth.dto';
import type {
  UpdateMemberPermissionsDto,
  UpdateMyProfileDto,
} from './dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getAll() {
    try {
      const users = await this.usersService.findAll();
      return sendSuccess('Users fetched successfully', users);
    } catch (error) {
      return sendError('Failed to fetch users', error);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('family-members')
  async getFamilyMembers(@Req() req: AuthenticatedRequest) {
    try {
      const members = await this.usersService.findFamilyMembers(req.user.uid);
      return sendSuccess('Family members fetched successfully', members);
    } catch (error) {
      return sendError(
        'Failed to fetch family members',
        getErrorMessage(error),
      );
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('me/profile-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMyProfilePhoto(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: { buffer: Buffer; mimetype: string; size: number },
  ) {
    try {
      const user = await this.usersService.uploadMyProfilePhoto(
        req.user.uid,
        file,
      );
      return sendSuccess('Profile photo updated successfully', user);
    } catch (error) {
      return sendError(
        'Failed to update profile photo',
        getErrorMessage(error),
      );
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete('me/profile-photo')
  async removeMyProfilePhoto(@Req() req: AuthenticatedRequest) {
    try {
      const user = await this.usersService.removeMyProfilePhoto(req.user.uid);
      return sendSuccess('Profile photo removed successfully', user);
    } catch (error) {
      return sendError(
        'Failed to remove profile photo',
        getErrorMessage(error),
      );
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('me')
  async updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateMyProfileDto,
  ) {
    try {
      const user = await this.usersService.updateMyProfile(req.user.uid, body);
      return sendSuccess('Profile updated successfully', user);
    } catch (error) {
      return sendError('Failed to update profile', getErrorMessage(error));
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch(':id/permissions')
  async updateMemberPermissions(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateMemberPermissionsDto,
  ) {
    try {
      const member = await this.usersService.updateMemberPermissions(
        req.user.uid,
        id,
        body,
      );
      return sendSuccess('User permissions updated successfully', member);
    } catch (error) {
      return sendError(
        'Failed to update user permissions',
        getErrorMessage(error),
      );
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete(':id')
  async deleteFamilyMember(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    try {
      await this.usersService.deleteFamilyMember(req.user.uid, id);
      return sendSuccess('Family member deleted successfully', null);
    } catch (error) {
      return sendError(
        'Failed to delete family member',
        getErrorMessage(error),
      );
    }
  }
}
