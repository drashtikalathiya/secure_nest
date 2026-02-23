import { axiosInstance } from "./apiClient";

export const getPasswords = async () => {
  const { data } = await axiosInstance.get("/passwords", {
    meta: { fallbackMessage: "Failed to fetch passwords" },
  });
  return data;
};

export const createPassword = async (body) => {
  const { data } = await axiosInstance.post("/passwords", body, {
    meta: { fallbackMessage: "Failed to create password" },
  });
  return data;
};

export const updatePassword = async (passwordId, body) => {
  const { data } = await axiosInstance.patch(
    `/passwords/${passwordId}`,
    body,
    { meta: { fallbackMessage: "Failed to update password" } },
  );
  return data;
};

export const deletePassword = async (passwordId) => {
  const { data } = await axiosInstance.delete(`/passwords/${passwordId}`, {
    meta: { fallbackMessage: "Failed to delete password" },
  });
  return data;
};
