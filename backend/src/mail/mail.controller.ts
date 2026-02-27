import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { sendError, sendSuccess } from '../utils/responseHandler';
import { getErrorMessage } from '../utils/errorMessage';
import type { AuthenticatedRequest } from '../auth/dto/auth.dto';
import type { TestMailDto } from './dto/mail.dto';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('test')
  async sendTestEmail(
    @Req() req: AuthenticatedRequest,
    @Body() body: TestMailDto,
  ) {
    try {
      const to = typeof body?.to === 'string' ? body.to.trim() : '';
      const requestedBy = req.user.email || req.user.uid;

      const result = await this.mailService.sendTestEmail(to, requestedBy);
      if (!result.sent) {
        return sendError('Failed to send test email', result);
      }

      return sendSuccess('Test email sent successfully', result);
    } catch (error) {
      return sendError('Failed to send test email', getErrorMessage(error));
    }
  }
}
