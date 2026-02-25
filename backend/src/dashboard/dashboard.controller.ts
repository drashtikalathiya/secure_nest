import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { sendError, sendSuccess } from '../utils/responseHandler';
import { getErrorMessage } from '../utils/errorMessage';
import type { AuthenticatedRequest } from '../auth/dto/auth.dto';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(FirebaseAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview(@Req() req: AuthenticatedRequest) {
    try {
      const overview = await this.dashboardService.getOverview(req.user.uid);
      return sendSuccess('Dashboard overview fetched successfully', overview);
    } catch (error) {
      return sendError(
        'Failed to fetch dashboard overview',
        getErrorMessage(error),
      );
    }
  }
}
