import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
const AUTH_TOKEN_KEY = "sn_auth_token";

const getApiError = (data, fallback) => data?.error || data?.message || fallback;

export const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const setAuthToken = (token) => {
  if (!token) return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  delete axiosInstance.defaults.headers.common.Authorization;
};

axiosInstance.interceptors.request.use((config) => {
  if (!config?.headers?.Authorization) {
    const token = getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    const data = response?.data;
    if (data?.success === false) {
      const fallback =
        response.config?.meta?.fallbackMessage || "Request failed";
      return Promise.reject(new Error(getApiError(data, fallback)));
    }
    return response;
  },
  (error) => {
    const fallback = error?.config?.meta?.fallbackMessage || "Request failed";
    const data = error?.response?.data;
    return Promise.reject(new Error(getApiError(data, fallback)));
  },
);
