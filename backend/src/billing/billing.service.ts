import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { User } from '../users/user.entity';
import admin from '../../config/firebase-admin';
import {
  DEFAULT_SUBSCRIPTION_PLAN,
  getPlanMemberLimit,
  getSubscriptionPlanFromPriceId,
  SubscriptionPlan,
} from './subscription-plan';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  async createCheckoutSession(user, priceId: string) {
    const dbUser = await this.userRepo.findOne({
      where: { firebase_uid: user.uid },
    });

    if (!dbUser) {
      throw new NotFoundException('User account was not found.');
    }

    if (dbUser.role !== 'owner') {
      throw new ForbiddenException(
        'Only an owner can purchase a subscription.',
      );
    }

    const subscriptionPlan = getSubscriptionPlanFromPriceId(priceId);

    if (!subscriptionPlan) {
      throw new BadRequestException('Invalid Stripe price id for subscription.');
    }

    const isFamilyToSmallDowngrade =
      dbUser.is_subscribed &&
      dbUser.subscription_plan === 'family' &&
      subscriptionPlan === 'small';

    if (isFamilyToSmallDowngrade) {
      const smallPlanLimit = getPlanMemberLimit('small');
      const activeMembers = await this.userRepo.count({
        where: { family_owner_id: dbUser.id, role: 'member' },
      });

      if (activeMembers > smallPlanLimit) {
        throw new BadRequestException(
          'Seat limit exceeded. Remove members or upgrade plan.',
        );
      }
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        userId: user.uid,
        subscriptionPlan,
      },
    });

    return { url: session.url };
  }

  async activateSubscription(
    firebaseUid: string,
    subscribedId?: string | null,
    subscriptionPlan: SubscriptionPlan = DEFAULT_SUBSCRIPTION_PLAN,
  ) {
    await this.userRepo.update(
      { firebase_uid: firebaseUid },
      {
        is_subscribed: true,
        subscribed_id: subscribedId ?? null,
        subscription_plan: subscriptionPlan,
      },
    );

    const owner = await this.userRepo.findOne({
      where: { firebase_uid: firebaseUid, role: 'owner' },
    });

    if (!owner) return;

    await this.syncFirebaseClaims(owner.firebase_uid, {
      role: 'owner',
      is_subscribed: true,
      subscription_plan: owner.subscription_plan,
    });

    const members = await this.userRepo.find({
      where: { family_owner_id: owner.id, role: 'member' },
    });

    if (!members.length) return;

    await this.userRepo.update(
      { family_owner_id: owner.id, role: 'member' },
      { subscription_plan: owner.subscription_plan },
    );

    await Promise.all(
      members.map((member) =>
        this.syncFirebaseClaims(member.firebase_uid, {
          role: 'member',
          is_subscribed: true,
          subscription_plan: owner.subscription_plan,
        }),
      ),
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
        message: getErrorMessage(error),
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
      const subscriptionPlan =
        session.metadata?.subscriptionPlan === 'family' ? 'family' : 'small';

      if (userId) {
        await this.activateSubscription(userId, subscribedId, subscriptionPlan);
      }
    }

    return { received: true };
  }

  private async syncFirebaseClaims(
    firebaseUid: string,
    claims: Partial<{
      role: 'owner' | 'member';
      is_subscribed: boolean;
      subscription_plan: SubscriptionPlan;
    }>,
  ) {
    try {
      const userRecord = await admin.auth().getUser(firebaseUid);

      const nextClaims = {
        ...(userRecord.customClaims || {}),
        ...claims,
      };

      await admin.auth().setCustomUserClaims(firebaseUid, nextClaims);
    } catch (error) {
      console.error('Failed to sync Firebase claims:', {
        uid: firebaseUid,
        message: getErrorMessage(error),
      });
    }
  }
}
