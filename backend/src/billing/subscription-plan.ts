import {
  DEFAULT_SUBSCRIPTION_PLAN,
  MEMBER_LIMIT_BY_PLAN,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlan,
} from '../utils/constants';

const PLAN_BY_PRICE_ID: Record<string, SubscriptionPlan> = {
  [process.env.STRIPE_SMALL_PLAN_PRICE_ID]: SUBSCRIPTION_PLANS.SMALL,
  [process.env.STRIPE_FAMILY_PLAN_PRICE_ID]: SUBSCRIPTION_PLANS.FAMILY,
};

export function getSubscriptionPlanFromPriceId(
  priceId?: string | null,
): SubscriptionPlan | null {
  if (!priceId) return null;
  return PLAN_BY_PRICE_ID[priceId] || null;
}

export function getPlanMemberLimit(plan?: string | null): number {
  if (!plan) return MEMBER_LIMIT_BY_PLAN[DEFAULT_SUBSCRIPTION_PLAN];

  const normalized = plan.toLowerCase();
  if (normalized === SUBSCRIPTION_PLANS.FAMILY)
    return MEMBER_LIMIT_BY_PLAN.family;
  return MEMBER_LIMIT_BY_PLAN.small;
}
