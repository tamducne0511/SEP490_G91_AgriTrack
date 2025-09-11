import { create } from "zustand";
import {
  changePasswordApi,
  getMeApi,
  loginApi,
  updateProfileApi,
} from "@/services";
import { EAuthToken, EFarm, EUser } from "@/variables/common";

export const useAuthStore = create((set) => ({
user: (() => {
    try {
      const userStr = localStorage.getItem(EUser.CURRENT_USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem(EAuthToken.ACCESS_TOKEN) || null,
  loading: false,
  farmIds: (() => {
    try {
      const farmStr = localStorage.getItem(EFarm.CURRENT_FARM);
      return farmStr ? JSON.parse(farmStr) : null;
    } catch {
      return null;
    }
  })(),
  farm: null,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await loginApi({ email, password });
      const data = res.data;
      set({ user: data.user, token: data.token, loading: false });
      localStorage.setItem(EUser.CURRENT_USER, JSON.stringify(data.user));
      if (data.token) localStorage.setItem(EAuthToken.ACCESS_TOKEN, data.token);
    } catch (err) {
      set({ error: err?.message || "Đăng nhập thất bại", loading: false });
    }
  },

  getMe: async () => {
     set({ loading: true });
    try {
      const res = await getMeApi();
      const data = res.data;
      localStorage.setItem(EUser.CURRENT_USER, JSON.stringify(data.user));
      localStorage.setItem(EFarm.CURRENT_FARM, JSON.stringify(data.farmId));
      set({ user: data.user, farmIds: data.farmId, farm: data.farm, loading: false });
    } catch (err) {
      console.error("getMe error:", err);
      // Nếu lỗi 401, clear localStorage và redirect to login
      if (err?.status === 401 || err?.response?.status === 401) {
        localStorage.clear();
        set({ user: null, token: null, farmIds: null, farm: null, loading: false });
        window.location.pathname = "/login";
        return;
      }
      set({ error: err?.message || "Lỗi lấy thông tin người dùng", loading: false });
    }
  },

  updateProfile: async (payload) => {
    try {
      const { data } = await updateProfileApi(payload);
      localStorage.setItem(EUser.CURRENT_USER, JSON.stringify(data));
      set({ user: data });
    } catch (err) {
      throw err;
    }
  },

  changePassword: async (payload) => {
    try {
      await changePasswordApi(payload);
    } catch (err) {
      throw err;
    }
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, token: null, farmIds: null, farm: null });
    window.location.pathname = "/login";
  },

  // Kiểm tra xem user có đăng nhập không
  isAuthenticated: () => {
    const token = localStorage.getItem(EAuthToken.ACCESS_TOKEN);
    const user = localStorage.getItem(EUser.CURRENT_USER);
    const result = !!(token && user);
    return result;
    // window.location.reload();
  },
}));