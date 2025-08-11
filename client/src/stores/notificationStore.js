import {
  createNotificationApi,
  deleteNotificationApi,
  fetchNotificationDetailApi,
  fetchNotificationsApi,
  fetchNotificationsExpertApi,
  updateNotificationApi,
  fetchNotificationsQuesApi,
  fetchNotificationsExpertQuesApi,
  fetchTotalNotiUnread,
  markNotificationAsRead,
  fetchTotalQuesNotiUnread,
  marQueskNotificationAsRead,
} from "@/services";
import { notification } from "antd";
import { create } from "zustand";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  pagination: { total: 0, page: 1, pageSize: 10 },
  loading: false,
  error: null,
  notificationDetail: null,
  notificationQues: [],
  paginationQues: { total: 0, page: 1, pageSize: 10 },
  totalUnread: 0,
  totalQuesNotiUnread: 0,

  markNotificationAsRead: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await markNotificationAsRead(id);
      get().fetchTotalNotiUnread()

      return data;
    } catch (err) {
      set({
        error: err?.message || "Lỗi đánh dấu thông báo đã đọc",
        loading: false,
      });

      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchTotalNotiUnread: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchTotalNotiUnread();
      set({ totalUnread: data?.data || 0, loading: false });
    } catch (err) {
      set({
        error: err?.message || "Lỗi lấy tổng số thông báo chưa đọc",
        loading: false,
        totalUnread: 0,
      });
      throw err;
    }
  },

  markQuesNotificationAsRead: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await marQueskNotificationAsRead(id);
      get().fetchQuesTotalNotiUnread()

      return data;
    } catch (err) {
      set({
        error: err?.message || "Lỗi đánh dấu câu hỏi đã đọc",
        loading: false,
      });

      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchQuesTotalNotiUnread: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchTotalQuesNotiUnread();
      set({ totalQuesNotiUnread: data?.data || 0, loading: false });
    } catch (err) {
      set({
        error: err?.message || "Lỗi lấy tổng số câu hỏi chưa đọc",
        loading: false,
        totalQuesNotiUnread: 0,
      });
      throw err;
    }
  },

  fetchNotificationDetail: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchNotificationDetailApi(id);
      set({ notificationDetail: data.data, loading: false });
      return data.data;
    } catch (err) {
      set({
        error: err?.message || "Lỗi lấy chi tiết thông báo",
        loading: false,
        notificationDetail: null,
      });
      throw err;
    }
  },
  fetchNotificationsQues: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { role } = params;
      let data;
      if (role === "expert") {
        // Gọi API lấy noti theo farm cho expert
        data = await fetchNotificationsExpertQuesApi();
      } else {
        if (params?.id)
          // Admin hoặc không truyền role thì lấy tất cả
          data = await fetchNotificationsQuesApi(params.id);
      }

      const mappedData = (data?.data || []).filter(
        (noti) => noti.user.role !== role
      );
      set({
        notificationQues: mappedData || [],
        paginationQues: {
          total: data?.totalItem || 0,
          page: data?.page || 1,
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
  fetchNotifications: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { role, ...rest } = params;
      let data;
      if (role === "expert" && rest.farmId) {
        // Gọi API lấy noti theo farm cho expert
        data = await fetchNotificationsExpertApi({
          ...rest,
        });
      } else {
        // Admin hoặc không truyền role thì lấy tất cả
        data = await fetchNotificationsApi(rest);
      }
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
  createNotification: async (role, farmId, formData) => {
    set({ loading: true, error: null });
    try {
      await createNotificationApi(formData);
      set({ loading: false });
      get().fetchNotifications({
        role,
        farmId,
        page: get().pagination.page,
      });
    } catch (err) {
      set({ error: err?.message || "Lỗi tạo thông báo", loading: false });
      throw err;
    }
  },

  // Sửa notification
  updateNotification: async (id, role, farmId, formData) => {
    set({ loading: true, error: null });
    try {
      await updateNotificationApi(id, formData);
      set({ loading: false });
      get().fetchNotifications({
        role,
        farmId,
        page: get().pagination.page,
      });
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
    } catch (err) {
      set({ error: err?.message || "Lỗi xoá thông báo", loading: false });
      throw err;
    }
  },
}));
