import { create } from "zustand";
import { loginApi } from "@/services";
import { EAuthToken, EUser } from "@/variables/common";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
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
  logout: () => {
    localStorage.clear();
    set({ user: null, token: null });
    window.location.reload();
  },
}));
