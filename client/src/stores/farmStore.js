import { create } from "zustand";
import {
  fetchFarmsApi,
  createFarmApi,
  deleteFarmApi,
  updateFarmApi,
  getFarmDetail,
} from "@/services";

export const useFarmStore = create((set, get) => ({
  farms: [],
  pagination: { total: 0, page: 1, pageSize: 10 },
  loading: false,
  error: null,
  farmDetail: null,

  fetchFarms: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchFarmsApi(params);
      set({
        farms: data.data || [],
        pagination: {
          total: data.totalItem || 0,
          page: data.page || 1,
          pageSize: params.pageSize || 10,
        },
        loading: false,
      });
    } catch (err) {
      set({ error: err?.message || "Lỗi tải danh sách vườn", loading: false });
    }
  },

  getFarmDetail: async (id) => {
    set({ loading: true });
    try {
      const { data } = await getFarmDetail(id);
      console.log("Farm detail:", data);
      set({ farmDetail: data, loading: false });
    } catch (e) {
      set({ farmDetail: null, loading: false });
    }
  },

  createFarm: async (payload) => {
    set({ loading: true, error: null });
    try {
      await createFarmApi(payload);
      set({ loading: false });
      // reload lại list nếu muốn (gọi fetchFarms bên ngoài sau khi thành công)
    } catch (err) {
      set({ error: err?.message || "Lỗi tạo vườn", loading: false });
      throw err;
    }
  },
  updateFarm: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      await updateFarmApi(id, payload);
      set({ loading: false });
    } catch (err) {
      set({ error: err?.message || "Lỗi cập nhật vườn", loading: false });
      throw err;
    }
  },

  deleteFarm: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteFarmApi(id);
      set({ loading: false });
      // reload lại list nếu muốn (gọi fetchFarms bên ngoài sau khi thành công)
    } catch (err) {
      set({ error: err?.message || "Lỗi xoá vườn", loading: false });
      throw err;
    }
  },
}));
