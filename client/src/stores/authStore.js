import { create } from "zustand";
import { changePasswordApi, getMeApi, loginApi, updateProfileApi } from "@/services";
import { EAuthToken, EFarm, EUser } from "@/variables/common";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
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
    try {
      const res = await getMeApi();
      const data = res.data;
      localStorage.setItem(EUser.CURRENT_USER, JSON.stringify(data.user));
      localStorage.setItem(EFarm.CURRENT_FARM, JSON.stringify(data.farm));
      set({ user: data.user, farm: data.farm });
    } catch (err) {
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
    window.location.reload();
  },
}));
