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

  const status = err?.response?.status;
  const data = err?.response?.data;

  // Chuẩn hoá message từ nhiều định dạng lỗi khác nhau
  let normalizedMessage = "Có lỗi xảy ra. Vui lòng thử lại";
  if (typeof data === "string") {
    normalizedMessage = data;
  } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
    // express-validator: [{ msg, param }]
    normalizedMessage = data.errors
      .map((e) => (e?.param ? `${e.param}: ${e?.msg || "Không hợp lệ"}` : e?.msg))
      .filter(Boolean)
      .join("; ");
  } else if (typeof data?.message === "string") {
    normalizedMessage = data.message;
  } else if (data?.message && typeof data.message === "object") {
    // Trường hợp message là object -> stringify ngắn gọn
    try {
      normalizedMessage = JSON.stringify(data.message);
    } catch (_) {
      normalizedMessage = "Yêu cầu không hợp lệ";
    }
  } else if (err?.message) {
    normalizedMessage = err.message;
  }

  if (status === 401) {
    if (isNotificationApi) {
      return Promise.reject({ status, message: normalizedMessage, data });
    } else {
      localStorage.clear();
      window.location.pathname = RoutePaths.LOGIN;
      return;
    }
  }

  if (status === 403) {
    window.location.pathname = RoutePaths.LOGIN;
    return;
  }

  return Promise.reject({ status, message: normalizedMessage, data });
};

client.interceptors.request.use(requestHandler, (error) =>
  Promise.reject(error)
);
client.interceptors.response.use((res) => res, responseErrorHandler);
