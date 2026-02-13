import { Controller, Post, Req, UseGuards, Body } from '@nestjs/common';
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
        family_owner_id: user.family_owner_id,
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
        family_owner_id: user.family_owner_id,
      });
    } catch (error) {
      return sendError('Registration failed', getErrorMessage(error));
    }
  }
}
