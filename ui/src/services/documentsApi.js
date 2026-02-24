import { axiosInstance } from "./apiClient";

export const getDocuments = async () => {
  const { data } = await axiosInstance.get("/documents", {
    meta: { fallbackMessage: "Failed to fetch documents" },
  });
  return data;
};

export const createFolder = async (body) => {
  const { data } = await axiosInstance.post("/documents/folders", body, {
    meta: { fallbackMessage: "Failed to create folder" },
  });
  return data;
};

export const deleteFolder = async (folderId) => {
  const { data } = await axiosInstance.delete(`/documents/folders/${folderId}`, {
    meta: { fallbackMessage: "Failed to delete folder" },
  });
  return data;
};

export const updateFolder = async (folderId, body) => {
  const { data } = await axiosInstance.patch(
    `/documents/folders/${folderId}`,
    body,
    { meta: { fallbackMessage: "Failed to update folder" } },
  );
  return data;
};

export const createDocument = async (body) => {
  const formData = new FormData();
  Object.entries(body || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }
    formData.append(key, value);
  });
  const { data } = await axiosInstance.post("/documents/files", formData, {
    meta: { fallbackMessage: "Failed to upload document" },
  });
  return data;
};

export const updateDocument = async (documentId, body) => {
  const formData = new FormData();
  Object.entries(body || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }
    formData.append(key, value);
  });
  const { data } = await axiosInstance.patch(
    `/documents/files/${documentId}`,
    formData,
    { meta: { fallbackMessage: "Failed to update document" } },
  );
  return data;
};

export const deleteDocument = async (documentId) => {
  const { data } = await axiosInstance.delete(`/documents/files/${documentId}`, {
    meta: { fallbackMessage: "Failed to delete document" },
  });
  return data;
};
