import { create } from "zustand";
import {
  fetchFarmersApi,
  createFarmerApi,
  updateFarmerApi,
  deleteFarmerApi,
  assignFarmerToGardenApi,
} from "@/services";

export const useFarmerStore = create((set, get) => ({
  farmers: [],
  pagination: { total: 0, page: 1, pageSize: 10 },
  loading: false,
  error: null,

  // Lấy danh sách farmer
  fetchFarmers: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchFarmersApi(params);
      set({
        farmers: data.data || [],
        pagination: {
          total: data.totalItem || 0,
          page: data.page || 1,
          pageSize: params.pageSize || 10,
        },
        loading: false,
      });
    } catch (err) {
      set({
        error: err?.message || "Lỗi tải danh sách nông dân",
        loading: false,
      });
    }
  },

  // Tạo mới farmer
  createFarmer: async (payload) => {
    set({ loading: true, error: null });
    try {
      await createFarmerApi(payload);
      set({ loading: false });
      const { pagination, fetchFarmers } = get();
      fetchFarmers({ page: pagination.page });
    } catch (err) {
      set({ error: err?.message || "Lỗi tạo nông dân", loading: false });
      throw err;
    }
  },

  // Sửa farmer
  updateFarmer: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      await updateFarmerApi(id, payload);
      set({ loading: false });
      const { pagination, fetchFarmers } = get();
      fetchFarmers({ page: pagination.page });
    } catch (err) {
      set({ error: err?.message || "Lỗi cập nhật nông dân", loading: false });
      throw err;
    }
  },

  // Vô hiệu hóa farmer (có gửi nội dung qua email)
  deleteFarmer: async (id, messageContent) => {
    set({ loading: true, error: null });
    try {
      await deleteFarmerApi(id, { message: messageContent });
      set({ loading: false });
      const { pagination, fetchFarmers } = get();
      fetchFarmers({ page: pagination.page });
    } catch (err) {
      set({ error: err?.message || "Lỗi vô hiệu hoá nông dân", loading: false });
      throw err;
    }
  },

  // Gán garden cho farmer
  assignGardenToFarmer: async (gardenId, farmerId) => {
    set({ loading: true, error: null });
    try {
      await assignFarmerToGardenApi({ gardenId, farmerId });
      set({ loading: false });
    } catch (err) {
      set({ error: err?.message || "Lỗi gán vườn", loading: false });
      throw err;
    }
  },
}));