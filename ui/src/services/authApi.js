const API_URL = "http://localhost:3001";

export const backendSignup = async (token, body) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Signup failed");
  }

  return res.json();
};

export const backendLogin = async (token) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Login failed");
  }

  return res.json();
};
