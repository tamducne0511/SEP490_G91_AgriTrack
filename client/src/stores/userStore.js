import { create } from "zustand";
import {
  fetchUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  assignUserToFarmApi,
} from "@/services";

export const useUserStore = create((set, get) => ({
  users: [],
  pagination: { total: 0, page: 1, pageSize: 10 },
  loading: false,
  error: null,

  // Lấy danh sách user theo role (role: "expert" | "farm-admin" | ...)
  fetchUsers: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchUsersApi(params);
      set({
        users: data.data || [],
        pagination: {
          total: data.totalItem || 0,
          page: data.page || 1,
          pageSize: params.pageSize || 10,
        },
        loading: false,
      });
    } catch (err) {
      set({
        error: err?.message || "Lỗi tải danh sách người dùng",
        loading: false,
      });
    }
  },

  // Tạo user (cần truyền role)
  createUser: async (payload) => {
    set({ loading: true, error: null });
    try {
      await createUserApi(payload);
      set({ loading: false });
      const { pagination, fetchUsers } = get();
      fetchUsers({ page: pagination.page, role: payload.role });
    } catch (err) {
      set({ error: err?.message || "Lỗi tạo người dùng", loading: false });
      throw err;
    }
  },

  // Sửa user (cần truyền role để reload đúng loại)
  updateUser: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      await updateUserApi(id, payload);
      set({ loading: false });
      const { pagination, fetchUsers } = get();
      fetchUsers({ page: pagination.page, role: payload.role });
    } catch (err) {
      set({ error: err?.message || "Lỗi cập nhật người dùng", loading: false });
      throw err;
    }
  },

  // Xóa user (cần truyền role để reload đúng loại)
  deleteUser: async (id, role) => {
    set({ loading: true, error: null });
    try {
      await deleteUserApi(id);
      set({ loading: false });
      const { pagination, fetchUsers } = get();
      fetchUsers({ page: pagination.page, role });
    } catch (err) {
      set({ error: err?.message || "Lỗi xoá người dùng", loading: false });
      throw err;
    }
  },

  assignUserToFarm: async (farmId, userId) => {
    set({ loading: true, error: null });
    try {
      await assignUserToFarmApi({ farmId, userId });
      set({ loading: false });
    } catch (err) {
      set({ error: err?.message || "Lỗi gán trang trại", loading: false });
      throw err;
    }
  },
  getListFarmAssignedExpert: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await getListFarmAssignedExpert(id);
      set({
        listFarmAssignedExpert: data?.list,
        loading: false,
      });
      return data.data;
    } catch (err) {
      set({
        error: err?.message || "Lỗi tải danh sách trang trại được gán",
        loading: false,
        listFarmAssignedExpert: [],
      });
      throw err;
    }
  },

  assignExpertToFarm: async (expertId, farmId) => {
    set({ loading: true, error: null });
    try {
      await assignExpertToFarmApi({ expertId, farmId });
      set({ loading: false });
    } catch (err) {
      set({
        error: err?.message || "Lỗi gán chuyên gia",
        loading: false,
      });
      throw err;
    }
  },

  unassignExpertFromFarm: async (assignedFarmId) => {
    set({ loading: true });
    try {
      await unassignExpertFromFarmApi(assignedFarmId);
      set({ loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
}));
