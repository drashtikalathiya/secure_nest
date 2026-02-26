import {
  Controller,
  Post,
  Req,
  UseGuards,
  Body,
  Headers,
  Get,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { BillingService } from './billing.service';
import { sendSuccess } from '../utils/responseHandler';
import { SUBSCRIPTION_PLANS } from '../utils/constants';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('plans')
  getPlans() {
    return sendSuccess('Plans fetched', [
      {
        id: SUBSCRIPTION_PLANS.SMALL,
        title: 'Small Nest',
        price_id: process.env.STRIPE_SMALL_PLAN_PRICE_ID || '',
        price: '$9',
        period: '/ 30 days',
        maxMembers: 3,
        description: 'Perfect for couples or small families',
        features: [
          'Up to 3 members',
          'Encrypted Vault',
          'Shared Documents',
          '30 Days Validity',
        ],
      },
      {
        id: SUBSCRIPTION_PLANS.FAMILY,
        title: 'Family Nest',
        price_id: process.env.STRIPE_FAMILY_PLAN_PRICE_ID || '',
        price: '$15',
        period: '/ 30 days',
        maxMembers: 6,
        popular: true,
        description: 'Best for secure family living',
        features: [
          'Up to 6 members',
          'Encrypted Vault',
          'Shared Documents',
          'Medical Records Storage',
          'Priority Support',
          '30 Days Validity',
        ],
      },
    ]);
  }

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
