import { axiosInstance } from "./apiClient";

export const createInvitation = async (body) => {
  const { data } = await axiosInstance.post("/invitations", body, {
    meta: { fallbackMessage: "Failed to create invitation" },
  });
  return data;
};

export const getPendingInvitations = async () => {
  const { data } = await axiosInstance.get("/invitations/pending", {
    meta: { fallbackMessage: "Failed to fetch pending invitations" },
  });
  return data;
};

export const resendInvitation = async (invitationId) => {
  const { data } = await axiosInstance.post(
    `/invitations/${invitationId}/resend`,
    null,
    { meta: { fallbackMessage: "Failed to resend invitation" } },
  );
  return data;
};

export const cancelInvitation = async (invitationId) => {
  const { data } = await axiosInstance.delete(`/invitations/${invitationId}`, {
    meta: { fallbackMessage: "Failed to cancel invitation" },
  });
  return data;
};

export const validateInvitationToken = async (token) => {
  const { data } = await axiosInstance.get("/invitations/validate", {
    params: { token },
    meta: { fallbackMessage: "Invalid invitation" },
  });
  return data;
};

export const acceptInvitation = async (token) => {
  const { data } = await axiosInstance.post(
    "/invitations/accept",
    { token },
    { meta: { fallbackMessage: "Failed to accept invitation" } },
  );
  return data;
};
