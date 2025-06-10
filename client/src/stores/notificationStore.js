import { create } from "zustand";
import {
  fetchNotificationsApi,
  createNotificationApi,
  updateNotificationApi,
  deleteNotificationApi,
} from "@/services";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  pagination: { total: 0, page: 1, pageSize: 10 },
  loading: false,
  error: null,

  // Lấy danh sách notification
  fetchNotifications: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchNotificationsApi(params);
      set({
        notifications: data.data || [],
        pagination: {
          total: data.totalItem || 0,
          page: data.page || 1,
          pageSize: params.pageSize || 10,
        },
        loading: false,
      });
    } catch (err) {
      set({
        error: err?.message || "Lỗi tải danh sách thông báo",
        loading: false,
      });
    }
  },

  // Thêm notification
  createNotification: async (formData) => {
    set({ loading: true, error: null });
    try {
      await createNotificationApi(formData);
      set({ loading: false });
      get().fetchNotifications({ page: get().pagination.page });
    } catch (err) {
      set({ error: err?.message || "Lỗi tạo thông báo", loading: false });
      throw err;
    }
  },

  // Sửa notification
  updateNotification: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      await updateNotificationApi(id, formData);
      set({ loading: false });
      get().fetchNotifications({ page: get().pagination.page });
    } catch (err) {
      set({ error: err?.message || "Lỗi cập nhật thông báo", loading: false });
      throw err;
    }
  },

  // Xoá notification
  deleteNotification: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteNotificationApi(id);
      set({ loading: false });
      get().fetchNotifications({ page: get().pagination.page });
    } catch (err) {
      set({ error: err?.message || "Lỗi xoá thông báo", loading: false });
      throw err;
    }
  },
}));
