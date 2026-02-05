import { Controller, Post, Req, UseGuards, Body, Res } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../utils/responseHandler';

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
        role: user.role,
        is_subscribed: user.is_subscribed,
      });
    } catch (error) {
      return sendError('Authentication failed', error.message);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('register')
  async register(@Req() req, @Body() body) {
    try {
      const user = await this.authService.registerUser(req.user, body);

      return sendSuccess('User registered successfully', user);
    } catch (error) {
      return sendError('Registration failed', error.message);
    }
  }
}
