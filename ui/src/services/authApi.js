const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const parseApiResponse = async (res, fallbackMessage) => {
  let data = null;

  try {
    data = await res.json();
  } catch (error) {
    if (!res.ok) throw new Error(fallbackMessage);
    return null;
  }

  if (!res.ok || data?.success === false) {
    throw new Error(data?.error || data?.message || fallbackMessage);
  }

  return data;
};

export const backendSignup = async (token, body) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  return parseApiResponse(res, "Signup failed");
};

export const uploadSignupProfilePhoto = async (token, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/auth/profile-photo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseApiResponse(res, "Profile photo upload failed");
};

export const backendLogin = async (token) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseApiResponse(res, "Login failed");
};

export const getPostLoginPath = (authData) => {
  const role = authData?.role;
  const isSubscribed = Boolean(authData?.is_subscribed);

  if (role === "member") return "/dashboard";
  if (isSubscribed) return "/dashboard";
  return "/subscription";
};
