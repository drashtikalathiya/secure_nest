const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const getApiError = (data, fallback) => data?.error || data?.message || fallback;

export const createInvitation = async (token, body) => {
  const res = await fetch(`${API_URL}/invitations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || !data?.success) {
    throw new Error(getApiError(data, "Failed to create invitation"));
  }

  return data;
};

export const getPendingInvitations = async (token) => {
  const res = await fetch(`${API_URL}/invitations/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(getApiError(data, "Failed to fetch pending invitations"));
  }

  return data;
};

export const resendInvitation = async (token, invitationId) => {
  const res = await fetch(`${API_URL}/invitations/${invitationId}/resend`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(getApiError(data, "Failed to resend invitation"));
  }

  return data;
};

export const cancelInvitation = async (token, invitationId) => {
  const res = await fetch(`${API_URL}/invitations/${invitationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(getApiError(data, "Failed to cancel invitation"));
  }

  return data;
};

export const validateInvitationToken = async (token) => {
  const res = await fetch(
    `${API_URL}/invitations/validate?token=${encodeURIComponent(token)}`,
  );
  const data = await res.json();

  if (!res.ok || !data?.success) {
    throw new Error(getApiError(data, "Invalid invitation"));
  }

  return data;
};

export const acceptInvitation = async (token, authToken) => {
  const res = await fetch(`${API_URL}/invitations/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ token }),
  });

  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(getApiError(data, "Failed to accept invitation"));
  }

  return data;
};
