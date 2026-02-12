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
