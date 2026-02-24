export const SUBSCRIPTION_PLANS = [
  {
    id: "small",
    title: "Small Nest",
    price_id: "price_1Sxh5kCw3kMYCRHmpFs4zQ0u",
    price: "$9",
    period: "/ 30 days",
    maxMembers: 3,
    description: "Perfect for couples or small families",
    features: [
      "Up to 3 members",
      "Encrypted Vault",
      "Shared Documents",
      "30 Days Validity",
    ],
  },
  {
    id: "family",
    title: "Family Nest",
    price_id: "price_1Sxh7CCw3kMYCRHm7y4plN5p",
    price: "$15",
    period: "/ 30 days",
    maxMembers: 6,
    popular: true,
    description: "Best for secure family living",
    features: [
      "Up to 6 members",
      "Encrypted Vault",
      "Shared Documents",
      "Medical Records Storage",
      "Priority Support",
      "30 Days Validity",
    ],
  },
];

export const normalizePlanId = (planId) =>
  String(planId || "").toLowerCase() === "family" ? "family" : "small";

