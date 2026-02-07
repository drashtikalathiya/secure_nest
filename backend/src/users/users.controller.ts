import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UsersService } from './users.service';
import { sendError, sendSuccess } from '../utils/responseHandler';

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
}
