import { Controller, Get, Req, UseGuards } from '@nestjs/common';
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
}
