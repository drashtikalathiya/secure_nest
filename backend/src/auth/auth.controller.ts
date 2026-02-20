import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../utils/responseHandler';
import { getErrorMessage } from '../utils/errorMessage';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('login')
  async login(@Req() req) {
    try {
      const user = await this.authService.validateUser(req.user);

      return sendSuccess('Login successful', {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_photo_url: user.profile_photo_url,
        role: user.role,
        is_subscribed: user.is_subscribed,
        subscription_plan: user.subscription_plan,
        family_owner_id: user.family_owner_id,
        permission_password_access_level: user.permission_password_access_level,
        permission_contacts_access_level: user.permission_contacts_access_level,
        permission_documents_access_level: user.permission_documents_access_level,
        permission_invite_others: user.permission_invite_others,
        permission_export_data: user.permission_export_data,
      });
    } catch (error) {
      return sendError('Authentication failed', getErrorMessage(error));
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('register')
  async register(@Req() req, @Body() body) {
    try {
      const user = await this.authService.registerUser(req.user, body);

      return sendSuccess('User registered successfully', {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_photo_url: user.profile_photo_url,
        role: user.role,
        is_subscribed: user.is_subscribed,
        subscription_plan: user.subscription_plan,
        family_owner_id: user.family_owner_id,
        permission_password_access_level: user.permission_password_access_level,
        permission_contacts_access_level: user.permission_contacts_access_level,
        permission_documents_access_level: user.permission_documents_access_level,
        permission_invite_others: user.permission_invite_others,
        permission_export_data: user.permission_export_data,
      });
    } catch (error) {
      return sendError('Registration failed', getErrorMessage(error));
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('profile-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePhoto(
    @Req() req,
    @UploadedFile() file: { buffer: Buffer; mimetype: string; size: number },
  ) {
    try {
      const profile_photo_url = await this.authService.uploadSignupProfilePhoto(
        req.user,
        file,
      );
      return sendSuccess('Profile photo uploaded successfully', {
        profile_photo_url,
      });
    } catch (error) {
      return sendError('Failed to upload profile photo', getErrorMessage(error));
    }
  }
}
