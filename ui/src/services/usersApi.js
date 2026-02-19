const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const getApiError = (data, fallback) => data?.error || data?.message || fallback;

export const getFamilyMembers = async (token) => {
  const res = await fetch(`${API_URL}/users/family-members`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(getApiError(data, "Failed to fetch family members"));
  }

  return data;
};

export const uploadMyProfilePhoto = async (token, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/users/me/profile-photo`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(getApiError(data, "Failed to upload profile photo"));
  }

  return data;
};

export const removeMyProfilePhoto = async (token) => {
  const res = await fetch(`${API_URL}/users/me/profile-photo`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(getApiError(data, "Failed to remove profile photo"));
  }

  return data;
};

export const updateMyProfile = async (token, body) => {
  const res = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(getApiError(data, "Failed to update profile"));
  }

  return data;
};

export const updateMemberPermissions = async (token, memberId, body) => {
  const res = await fetch(`${API_URL}/users/${memberId}/permissions`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(getApiError(data, "Failed to update member permissions"));
  }

  return data;
};

export const deleteFamilyMember = async (token, memberId) => {
  const res = await fetch(`${API_URL}/users/${memberId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(getApiError(data, "Failed to delete family member"));
  }

  return data;
};
