import { create } from "zustand";
import {
  changePasswordApi,
  getMeApi,
  loginApi,
  updateProfileApi,
} from "@/services";
import { EAuthToken, EFarm, EUser } from "@/variables/common";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  farm: null,
  error: null,

  login: async (email, password) => {
    console.log("🔍 AuthStore: Starting login process");
    set({ loading: true, error: null });
    try {
      console.log("🔍 AuthStore: Calling loginApi");
      const res = await loginApi({ email, password });
      console.log("🔍 AuthStore: Login API response:", res);
      
      // Fix: Server returns { message, data } but we need to access res.data.data
      const data = res.data || res;
      console.log("🔍 AuthStore: Extracted data:", data);
      
      set({ user: data.user, token: data.token, loading: false });
      localStorage.setItem(EUser.CURRENT_USER, JSON.stringify(data.user));
      if (data.token) localStorage.setItem(EAuthToken.ACCESS_TOKEN, data.token);
      console.log("🔍 AuthStore: Login successful");
    } catch (err) {
      console.error("❌ AuthStore: Login error:", err);
      set({ error: err?.message || "Đăng nhập thất bại", loading: false });
    }
  },

  getMe: async () => {
    console.log("🔍 AuthStore: Starting getMe process");
    try {
      const res = await getMeApi();
      console.log("🔍 AuthStore: GetMe API response:", res);
      
      // Fix: Server returns { message, data } but we need to access res.data.data
      const data = res.data || res;
      console.log("🔍 AuthStore: Extracted getMe data:", data);
      
      localStorage.setItem(EUser.CURRENT_USER, JSON.stringify(data.user));
      localStorage.setItem(EFarm.CURRENT_FARM, JSON.stringify(data.farm));
      set({ user: data.user, farm: data.farm });
      console.log("🔍 AuthStore: GetMe successful");
    } catch (err) {
      console.error("❌ AuthStore: GetMe error:", err);
      set({ error: err?.message || "Lỗi lấy thông tin người dùng" });
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
    set({ user: null, token: null });
    // window.location.reload();
  },
}));
