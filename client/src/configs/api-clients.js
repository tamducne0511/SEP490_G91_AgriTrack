import axios from "axios";

import { EAuthToken } from "@/variables/common";
import { RoutePaths } from "@/routes/routes-constants";

console.log("🔍 API Client: Base URL configured as:", process.env.REACT_APP_API_BASE_URL);

export const client = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

const requestHandler = (config) => {
  console.log("🔍 API Client: Request interceptor - URL:", config.url);
  console.log("🔍 API Client: Request interceptor - Method:", config.method);
  const token = localStorage.getItem(EAuthToken.ACCESS_TOKEN);
  config.headers.Authorization = token ? `Bearer ${token}` : "";
  console.log("🔍 API Client: Request interceptor - Auth header:", token ? "Bearer ***" : "None");
  config.params = {
    ...config.params,
    version: Date.now(),
  };

  return config;
};

const responseErrorHandler = async (err) => {
  console.error("❌ API Client: Response error interceptor:", {
    status: err?.response?.status,
    statusText: err?.response?.statusText,
    url: err?.config?.url,
    message: err?.response?.data?.message || err?.message,
    data: err?.response?.data
  });
  
  // if (err?.response?.status === 401) {
  //   localStorage.clear();
  //   window.location.pathname = RoutePaths.LOGIN;
  //   return;
  // }

  // if (err?.response?.status === 403) {
  //   window.location.pathname = RoutePaths.LOGIN;
  //   return;
  // }

  // Return the error data or create a proper error object
  const errorData = err.response?.data || err;
  console.error("❌ API Client: Throwing error:", errorData);
  return Promise.reject(errorData);
};

client.interceptors.request.use(requestHandler, (error) =>
  Promise.reject(error)
);
client.interceptors.response.use((res) => res, responseErrorHandler);
