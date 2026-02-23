import { axiosInstance } from "./apiClient";

export const getContacts = async () => {
  const { data } = await axiosInstance.get("/contacts", {
    meta: { fallbackMessage: "Failed to fetch contacts" },
  });
  return data;
};

export const createContact = async (body) => {
  const { data } = await axiosInstance.post("/contacts", body, {
    meta: { fallbackMessage: "Failed to create contact" },
  });
  return data;
};

export const updateContact = async (contactId, body) => {
  const { data } = await axiosInstance.patch(`/contacts/${contactId}`, body, {
    meta: { fallbackMessage: "Failed to update contact" },
  });
  return data;
};

export const deleteContact = async (contactId) => {
  const { data } = await axiosInstance.delete(`/contacts/${contactId}`, {
    meta: { fallbackMessage: "Failed to delete contact" },
  });
  return data;
};
