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
    let data = null;
    try {
      data = await res.json();
    } catch {
      const text = await res.text();
      throw new Error(text || "Failed to create checkout");
    }

    const message = Array.isArray(data?.message)
      ? data.message[0]
      : data?.message;
    throw new Error(message || "Failed to create checkout");
  }

  return res.json();
}
