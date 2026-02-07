import {
  Controller,
  Post,
  Req,
  UseGuards,
  Body,
  Headers,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Post('create-checkout-session')
  @UseGuards(FirebaseAuthGuard)
  createSession(@Req() req, @Body('priceId') priceId: string) {
    return this.billingService.createCheckoutSession(req.user, priceId);
  }

  @Post('webhook')
  handleWebhook(@Req() req, @Headers('stripe-signature') signature: string) {
    return this.billingService.handleWebhook(req.body, signature);
  }
}
