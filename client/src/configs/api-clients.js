import axios from "axios";

import { EAuthToken } from "@/variables/common";
import { RoutePaths } from "@/routes/routes-constants";

export const client = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

const requestHandler = (config) => {
  const token = localStorage.getItem(EAuthToken.ACCESS_TOKEN);
  config.headers.Authorization = token ? `Bearer ${token}` : "";
  config.params = {
    ...config.params,
    version: Date.now(),
  };

  return config;
};

const responseErrorHandler = async (err) => {
  // Không tự động redirect cho notification API khi có lỗi 401
  const isNotificationApi = err?.config?.url?.includes('/notifications') || 
                           err?.config?.url?.includes('/notification');
  
  if (err?.response?.status === 401) {
    if (isNotificationApi) {
      // Chỉ reject error cho notification API, không redirect
      return Promise.reject(err.response?.data);
    } else {
      // Redirect cho các API khác
      localStorage.clear();
      window.location.pathname = RoutePaths.LOGIN;
      return;
    }
  }

  if (err?.response?.status === 403) {
    window.location.pathname = RoutePaths.LOGIN;
    return;
  }

  return Promise.reject(err.response?.data);
};

client.interceptors.request.use(requestHandler, (error) =>
  Promise.reject(error)
);
client.interceptors.response.use((res) => res, responseErrorHandler);
