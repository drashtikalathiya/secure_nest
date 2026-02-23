export const USER_ROLES = {
  OWNER: 'owner',
  MEMBER: 'member',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const SUBSCRIPTION_PLANS = {
  SMALL: 'small',
  FAMILY: 'family',
} as const;

export type SubscriptionPlan =
  (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];

export const DEFAULT_SUBSCRIPTION_PLAN: SubscriptionPlan =
  SUBSCRIPTION_PLANS.SMALL;

export const MEMBER_LIMIT_BY_PLAN: Record<SubscriptionPlan, number> = {
  small: 3,
  family: 6,
};
