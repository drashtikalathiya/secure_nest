import { axiosInstance } from "./apiClient";

export async function createCheckoutSession(priceId) {
  const { data } = await axiosInstance.post(
    "/billing/create-checkout-session",
    { priceId },
    { meta: { fallbackMessage: "Failed to create checkout" } },
  );
  return data;
}

export async function fetchSubscriptionPlans() {
  const { data } = await axiosInstance.get("/billing/plans", {
    meta: { fallbackMessage: "Failed to fetch plans" },
  });
  return data;
}
