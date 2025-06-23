import { create } from "zustand";
import {
  fetchGardensApi,
  createGardenApi,
  updateGardenApi,
  deleteGardenApi,
} from "@/services";

export const useGardenStore = create((set, get) => ({
  gardens: [],
  pagination: { total: 0, page: 1, pageSize: 10 },
  loading: false,
  error: null,

  fetchGardens: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchGardensApi(params);
      set({
        gardens: data.data || [],
        pagination: {
          total: data.total || data.pagination?.total || 0,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
        },
        loading: false,
      });
    } catch (err) {
      set({ error: err?.message || "Lỗi tải danh sách vườn", loading: false });
    }
  },

  createGarden: async (payload) => {
    set({ loading: true, error: null });
    try {
      await createGardenApi(payload);
      set({ loading: false });
      const { pagination, fetchGardens } = get();
      fetchGardens({ page: pagination.page });
    } catch (err) {
      set({ error: err?.message || "Lỗi tạo vườn", loading: false });
      throw err;
    }
  },
  updateGarden: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      await updateGardenApi(id, payload);
      set({ loading: false });
      const { pagination, fetchGardens } = get();
      fetchGardens({ page: pagination.page });
    } catch (err) {
      set({ error: err?.message || "Lỗi cập nhật vườn", loading: false });
      throw err;
    }
  },
  deleteGarden: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteGardenApi(id);
      set({ loading: false });
      const { pagination, fetchGardens } = get();
      fetchGardens({ page: pagination.page });
    } catch (err) {
      set({ error: err?.message || "Lỗi xoá vườn", loading: false });
      throw err;
    }
  },
}));
