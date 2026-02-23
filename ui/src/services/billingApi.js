import { axiosInstance } from "./apiClient";

export async function createCheckoutSession(priceId) {
  const { data } = await axiosInstance.post(
    "/billing/create-checkout-session",
    { priceId },
    { meta: { fallbackMessage: "Failed to create checkout" } },
  );
  return data;
}
