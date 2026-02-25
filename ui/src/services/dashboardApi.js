import { axiosInstance } from "./apiClient";

export const getDashboardOverview = async () => {
  const { data } = await axiosInstance.get("/dashboard/overview", {
    meta: { fallbackMessage: "Failed to fetch dashboard overview" },
  });
  return data;
};
