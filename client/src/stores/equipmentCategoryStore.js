import {
  createEquipmentCategoryApi,
  deleteEquipmentCategoryApi,
  fetchCategoryDetailApi,
  fetchEquipmentCategoriesApi,
  updateEquipmentCategoryApi,
} from "@/services"; // Ensure you update this path to the correct location
import { create } from "zustand";

export const useEquipmentCategoryStore = create((set, get) => ({
  categories: [],
  pagination: { total: 0, page: 1, pageSize: 10 },
  loading: false,
  error: null,
  categoryDetail: null,

  // Fetch all categories
  fetchCategories: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchEquipmentCategoriesApi(params);
      set({
        categories: data.data || [],
        pagination: {
          total: data.total || data.pagination?.total || 0,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
        },
        loading: false,
      });
    } catch (err) {
      set({
        error: err?.message || "Lỗi tải danh mục thiết bị",
        loading: false,
      });
    }
  },

  // Fetch category details by ID
  fetchCategoryDetail: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchCategoryDetailApi(id);
      set({
        categoryDetail: data.data || {}, // Store category details
        loading: false,
      });
    } catch (err) {
      set({
        error: err?.message || "Lỗi tải chi tiết danh mục thiết bị",
        loading: false,
      });
    }
  },

  // Create a new equipment category
  createCategory: async (payload) => {
    set({ loading: true, error: null });
    try {
      await createEquipmentCategoryApi(payload);
      set({ loading: false });
      const { pagination, fetchCategories } = get();
      fetchCategories({ page: pagination.page, pageSize: pagination.pageSize });
    } catch (err) {
      set({ error: err?.message || "Lỗi tạo danh mục", loading: false });
      throw err;
    }
  },

  // Update an existing equipment category
  updateCategory: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      await updateEquipmentCategoryApi(id, payload);
      set({ loading: false });
      const { pagination, fetchCategories } = get();
      fetchCategories({ page: pagination.page, pageSize: pagination.pageSize });
    } catch (err) {
      set({ error: err?.message || "Lỗi cập nhật danh mục", loading: false });
      throw err;
    }
  },

  // Delete a category
  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteEquipmentCategoryApi(id);
      set({ loading: false });
      const { pagination, fetchCategories } = get();
      fetchCategories({ page: pagination.page, pageSize: pagination.pageSize });
    } catch (err) {
      set({ error: err?.message || "Lỗi xoá danh mục", loading: false });
      throw err;
    }
  },
}));
