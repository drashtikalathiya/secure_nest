import { axiosInstance } from "./apiClient";

export const getFamilyMembers = async () => {
  const { data } = await axiosInstance.get("/users/family-members", {
    meta: { fallbackMessage: "Failed to fetch family members" },
  });
  return data;
};

export const uploadMyProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axiosInstance.patch(
    "/users/me/profile-photo",
    formData,
    { meta: { fallbackMessage: "Failed to upload profile photo" } },
  );
  return data;
};

export const removeMyProfilePhoto = async () => {
  const { data } = await axiosInstance.delete("/users/me/profile-photo", {
    meta: { fallbackMessage: "Failed to remove profile photo" },
  });
  return data;
};

export const updateMyProfile = async (body) => {
  const { data } = await axiosInstance.patch("/users/me", body, {
    meta: { fallbackMessage: "Failed to update profile" },
  });
  return data;
};

export const updateMemberPermissions = async (memberId, body) => {
  const { data } = await axiosInstance.patch(
    `/users/${memberId}/permissions`,
    body,
    { meta: { fallbackMessage: "Failed to update member permissions" } },
  );
  return data;
};

export const deleteFamilyMember = async (memberId) => {
  const { data } = await axiosInstance.delete(`/users/${memberId}`, {
    meta: { fallbackMessage: "Failed to delete family member" },
  });
  return data;
};
