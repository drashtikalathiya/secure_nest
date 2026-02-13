const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const getApiError = (data, fallback) => data?.error || data?.message || fallback;

const parseResponse = async (res, fallbackMessage) => {
  const data = await res.json();

  if (!res.ok || !data?.success) {
    throw new Error(getApiError(data, fallbackMessage));
  }

  return data;
};

export const getContacts = async (token) => {
  const res = await fetch(`${API_URL}/contacts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(res, "Failed to fetch contacts");
};

export const createContact = async (token, body) => {
  const res = await fetch(`${API_URL}/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  return parseResponse(res, "Failed to create contact");
};

export const updateContact = async (token, contactId, body) => {
  const res = await fetch(`${API_URL}/contacts/${contactId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  return parseResponse(res, "Failed to update contact");
};

export const deleteContact = async (token, contactId) => {
  const res = await fetch(`${API_URL}/contacts/${contactId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(res, "Failed to delete contact");
};
