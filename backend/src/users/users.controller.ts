import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UsersService } from './users.service';
import { sendError, sendSuccess } from '../utils/responseHandler';
import { getErrorMessage } from '../utils/errorMessage';

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
  async getFamilyMembers(@Req() req) {
    try {
      const members = await this.usersService.findFamilyMembers(req.user.uid);
      return sendSuccess('Family members fetched successfully', members);
    } catch (error) {
      return sendError('Failed to fetch family members', getErrorMessage(error));
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('me')
  async updateMyProfile(@Req() req, @Body() body) {
    try {
      const user = await this.usersService.updateMyProfile(req.user.uid, body);
      return sendSuccess('Profile updated successfully', user);
    } catch (error) {
      return sendError('Failed to update profile', getErrorMessage(error));
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch(':id/permissions')
  async updateMemberPermissions(@Req() req, @Param('id') id: string, @Body() body) {
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
  async deleteFamilyMember(@Req() req, @Param('id') id: string) {
    try {
      await this.usersService.deleteFamilyMember(req.user.uid, id);
      return sendSuccess('Family member deleted successfully', null);
    } catch (error) {
      return sendError('Failed to delete family member', getErrorMessage(error));
    }
  }
}
