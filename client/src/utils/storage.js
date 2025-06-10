import { EAuthToken } from "@/variables/common";

export const setItem = (key, value) => {
  return localStorage.setItem(key, value);
};

export const getItem = (key) => {
  return localStorage.getItem(key);
};

export const handleStorageToken = (token) => {
  setItem(EAuthToken.ACCESS_TOKEN, token?.accessToken);
  setItem(EAuthToken.REFRESH_TOKEN, token?.refreshToken);
};
