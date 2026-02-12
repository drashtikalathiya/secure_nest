import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { sendError, sendSuccess } from '../utils/responseHandler';
import { InvitationsService } from './invitations.service';
import { getErrorMessage } from '../utils/errorMessage';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post()
  async createInvitation(@Req() req, @Body() body) {
    try {
      const result = await this.invitationsService.createInvitation(
        req.user.uid,
        body,
      );
      return sendSuccess('Invitation created successfully', result);
    } catch (error) {
      return sendError('Failed to create invitation', getErrorMessage(error));
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('pending')
  async listPending(@Req() req) {
    try {
      const invites = await this.invitationsService.listPendingInvitations(
        req.user.uid,
      );
      return sendSuccess('Pending invitations fetched successfully', invites);
    } catch (error) {
      return sendError('Failed to fetch invitations', getErrorMessage(error));
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Post(':id/resend')
  async resendInvitation(@Req() req, @Param('id') id: string) {
    try {
      const invite = await this.invitationsService.resendInvitation(req.user.uid, id);
      return sendSuccess('Invitation resent successfully', invite);
    } catch (error) {
      return sendError('Failed to resend invitation', getErrorMessage(error));
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete(':id')
  async cancelInvitation(@Req() req, @Param('id') id: string) {
    try {
      await this.invitationsService.cancelInvitation(req.user.uid, id);
      return sendSuccess('Invitation cancelled successfully');
    } catch (error) {
      return sendError('Failed to cancel invitation', getErrorMessage(error));
    }
  }

  @Get('validate')
  async validateInvitation(@Query('token') token: string) {
    try {
      const result = await this.invitationsService.validateToken(token);
      return sendSuccess('Invitation validated', result);
    } catch (error) {
      return sendError('Failed to validate invitation', getErrorMessage(error));
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('accept')
  async acceptInvitation(@Req() req, @Body('token') token: string) {
    try {
      const result = await this.invitationsService.acceptInvitation(
        token,
        req.user.uid,
      );
      return sendSuccess('Invitation accepted successfully', result);
    } catch (error) {
      return sendError('Failed to accept invitation', getErrorMessage(error));
    }
  }
}
