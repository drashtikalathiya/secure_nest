const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const getApiError = (data, fallback) => data?.error || data?.message || fallback;

const parseResponse = async (res, fallbackMessage) => {
  const data = await res.json();

  if (!res.ok || !data?.success) {
    throw new Error(getApiError(data, fallbackMessage));
  }

  return data;
};

export const getPasswords = async (token) => {
  const res = await fetch(`${API_URL}/passwords`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(res, "Failed to fetch passwords");
};

export const createPassword = async (token, body) => {
  const res = await fetch(`${API_URL}/passwords`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  return parseResponse(res, "Failed to create password");
};

export const updatePassword = async (token, passwordId, body) => {
  const res = await fetch(`${API_URL}/passwords/${passwordId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  return parseResponse(res, "Failed to update password");
};

export const deletePassword = async (token, passwordId) => {
  const res = await fetch(`${API_URL}/passwords/${passwordId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(res, "Failed to delete password");
};
