import {
  fetchUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  assignUserToFarmApi,
  fetchUserDetailApi,
  getListFarmAssignedExpert,
  unassignExpertFromFarmApi,
  assignExpertToFarmApi,
  activeUserApi,
} from "@/services";
import { message } from "antd";
import { create } from "zustand";

export const useUserStore = create((set, get) => ({
  users: [],
  pagination: { total: 0, page: 1, pageSize: 10 },
  loading: false,
  error: null,
  userDetail: null,
  listFarmAssignedExpert: [],
  fetchUsers: async (params = {}) => {
    set({ loading: true });
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
      message.error(err?.message || "Lỗi tải danh sách người dùng");
      set({ loading: false });
    }
  },

  fetchUserDetail: async (id) => {
    set({ loading: true });
    try {
      const data = await fetchUserDetailApi(id);
      set({ userDetail: data.data, loading: false });
      return data.data;
    } catch (err) {
      message.error(err?.message || "Lỗi tải chi tiết người dùng");
      set({ loading: false, userDetail: null });
      throw err;
    }
  },

  // Hàm tạo user mới
  createUser: async (payload) => {
    set({ loading: true });
    try {
      await createUserApi(payload);
      set({ loading: false });
      const { pagination, fetchUsers } = get();
      fetchUsers({ page: pagination.page, role: payload.role });
    } catch (err) {
      message.error(err?.message || "Lỗi tạo người dùng");
      set({ loading: false });
      throw err;
    }
  },

  // Hàm chỉnh sửa user
  updateUser: async (id, payload) => {
    set({ loading: true });
    try {
      await updateUserApi(id, payload);
      set({ loading: false });
      const { pagination, fetchUsers } = get();
      fetchUsers({ page: pagination.page, role: payload.role });
    } catch (err) {
      message.error(err?.message || "Lỗi cập nhật người dùng");
      set({ loading: false });
      throw err;
    }
  },

  // Hàm xóa user
  deleteUser: async (id, role) => {
    set({ loading: true });
    try {
      console.log("🗑️ Deleting user:", { id, role }); // 👈 check ở đây
      await deleteUserApi(id, role);
      set({ loading: false });
      const { pagination, fetchUsers } = get();
      fetchUsers({ page: pagination.page, role });
    } catch (err) {
      message.error(err?.message || "Lỗi xoá người dùng");
      set({ loading: false });
      throw err;
    }
  },

  // Hàm kích hoạt user
  activeUser: async (id, role) => {
    set({ loading: true });
    try {
      await activeUserApi(id);
      set({ loading: false });
      const { pagination, fetchUsers } = get();
      fetchUsers({ page: pagination.page, role });
    } catch (err) {
      message.error(err?.message || "Lỗi kích hoạt người dùng");
      set({ loading: false });
      throw err;
    }
  },

  // Hàm gán user cho farm
  assignUserToFarm: async (farmId, userId) => {
    set({ loading: true });
    try {
      await assignUserToFarmApi({ farmId, userId });
      set({ loading: false });
    } catch (err) {
      message.error(err?.message || "Lỗi gán vườn");
      set({ loading: false });
      throw err;
    }
  },

  // Hàm quản lý expert-farm assignment
  getListFarmAssignedExpert: async (id) => {
    set({ loading: true });
    try {
      if (!id) return;
      const data = await getListFarmAssignedExpert(id);
      set({
        listFarmAssignedExpert: data?.list,
        loading: false,
      });
      return data.data;
    } catch (err) {
      message.error(err?.message || "Lỗi tải danh sách trang trại được gán");
      set({
        loading: false,
        listFarmAssignedExpert: [],
      });
      // throw err;
    }
  },

  // Hàm gán chuyên gia cho farm
  assignExpertToFarm: async (expertId, farmId) => {
    set({ loading: true });
    try {
      await assignExpertToFarmApi({ expertId, farmId });
      set({ loading: false });
    } catch (err) {
      message.error(err?.message || "Lỗi gán chuyên gia");
      set({
        loading: false,
      });
      throw err;
    }
  },

  // Hàm hủy gán chuyên gia cho farm
  unassignExpertFromFarm: async (assignedFarmId) => {
    set({ loading: true });
    try {
      await unassignExpertFromFarmApi(assignedFarmId);
      set({ loading: false });
    } catch (err) {
      message.error(err?.message || "Lỗi xoá chuyên gia khỏi vườn");
      set({ loading: false });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
