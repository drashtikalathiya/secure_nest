export type SubscriptionPlan = 'small' | 'family';

const PLAN_BY_PRICE_ID: Record<string, SubscriptionPlan> = {
  [process.env.STRIPE_SMALL_PLAN_PRICE_ID || 'price_1Sxh5kCw3kMYCRHmpFs4zQ0u']:
    'small',
  [process.env.STRIPE_FAMILY_PLAN_PRICE_ID || 'price_1Sxh7CCw3kMYCRHm7y4plN5p']:
    'family',
};

const MEMBER_LIMIT_BY_PLAN: Record<SubscriptionPlan, number> = {
  small: 3,
  family: 6,
};

export const DEFAULT_SUBSCRIPTION_PLAN: SubscriptionPlan = 'small';

export function getSubscriptionPlanFromPriceId(
  priceId?: string | null,
): SubscriptionPlan | null {
  if (!priceId) return null;
  return PLAN_BY_PRICE_ID[priceId] || null;
}

export function getPlanMemberLimit(plan?: string | null): number {
  if (!plan) return MEMBER_LIMIT_BY_PLAN[DEFAULT_SUBSCRIPTION_PLAN];

  const normalized = plan.toLowerCase();
  if (normalized === 'family') return MEMBER_LIMIT_BY_PLAN.family;
  return MEMBER_LIMIT_BY_PLAN.small;
}
