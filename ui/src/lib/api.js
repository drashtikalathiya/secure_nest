export async function createCheckoutSession(priceId, token) {
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/billing/create-checkout-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ priceId }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create checkout");
  }

  return res.json();
}
