import { create } from "zustand";
import { getDashboardData } from "@/services";

export const useDashboardStore = create((set) => ({
  dashboard: null,
  loading: false,
  error: null,
  async fetchDashboard(params) {
    set({ loading: true, error: null });
    try {
      const { data } = await getDashboardData(params);
      set({ dashboard: data, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },
}));
