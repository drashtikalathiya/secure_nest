import { axiosInstance } from "./apiClient";

export const getDashboardOverview = async () => {
  const { data } = await axiosInstance.get("/dashboard/overview", {
    meta: { fallbackMessage: "Failed to fetch dashboard overview" },
  });
  return data;
};

export const getDashboardRecentActivity = async (limit = 6) => {
  const { data } = await axiosInstance.get("/dashboard/recent-activity", {
    params: { limit },
    meta: { fallbackMessage: "Failed to fetch recent activity" },
  });
  return data;
};
