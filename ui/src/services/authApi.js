import { axiosInstance } from "./apiClient";

export const backendSignup = async (body) => {
  const { data } = await axiosInstance.post("/auth/register", body, {
    meta: { fallbackMessage: "Signup failed" },
  });
  return data;
};

export const uploadSignupProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axiosInstance.post("/auth/profile-photo", formData, {
    meta: { fallbackMessage: "Profile photo upload failed" },
  });
  return data;
};

export const backendLogin = async () => {
  const { data } = await axiosInstance.post("/auth/login", null, {
    meta: { fallbackMessage: "Login failed" },
  });
  return data;
};

export const backendForgotPassword = async (email) => {
  const { data } = await axiosInstance.post(
    "/auth/forgot-password",
    { email },
    {
      meta: { fallbackMessage: "Failed to send reset link" },
    },
  );
  return data;
};

export const getPostLoginPath = (authData) => {
  const role = authData?.role;
  const isSubscribed = Boolean(authData?.is_subscribed);

  if (role === "member") return "/dashboard";
  if (isSubscribed) return "/dashboard";
  return "/subscription";
};
