import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { User } from '../users/user.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  async createCheckoutSession(user, priceId: string) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: { userId: user.uid },
    });

    return { url: session.url };
  }

  async activateSubscription(
    firebaseUid: string,
    subscribedId?: string | null,
  ) {
    await this.userRepo.update(
      { firebase_uid: firebaseUid },
      {
        is_subscribed: true,
        subscribed_id: subscribedId ?? null,
      },
    );
  }

  async handleWebhook(rawBody: Buffer, signature: string | string[]) {
    const sig = Array.isArray(signature) ? signature[0] : signature;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      console.error('Stripe webhook signature verification failed:', {
        message: error?.message ?? error,
      });
      throw error;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscribedId =
        typeof session.subscription === 'string'
          ? session.subscription
          : (session.subscription?.id ?? null);

      if (userId) {
        await this.activateSubscription(userId, subscribedId);
      }
    }

    return { received: true };
  }
}
