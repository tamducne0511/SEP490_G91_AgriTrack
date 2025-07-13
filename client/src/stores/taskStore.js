import { create } from "zustand";
import {
  fetchTasksApi,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  assignTaskToFarmerApi,
  createDailyNoteApi,
  getAssignedTasksApi,
  getTaskDetail,
  getAssignedTaskDetail,
} from "@/services";

export const useTaskStore = create((set, get) => ({
  tasks: [],
  pagination: { total: 0, page: 1, pageSize: 10 },
  loading: false,
  error: null,
  taskDetail: null,
  myTask: null,

  fetchTasks: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchTasksApi(params);
      set({
        tasks: data.data || [],
        pagination: {
          total: data.totalItem || 0,
          page: data.page || 1,
          pageSize: params.pageSize || 10,
        },
        loading: false,
      });
    } catch (err) {
      set({ error: err?.message || "Lỗi tải danh sách task", loading: false });
    }
  },

  fetchTaskDetail: async (id) => {
    set({ loading: true });
    try {
      const { data } = await getTaskDetail(id);
      set({ taskDetail: data, loading: false });
    } catch (e) {
      set({ taskDetail: null, loading: false });
    }
  },

  createTask: async (payload) => {
    set({ loading: true, error: null });
    try {
      await createTaskApi(payload);
      set({ loading: false });
      const { pagination, fetchTasks } = get();
      fetchTasks({ page: pagination.page });
    } catch (err) {
      set({ error: err?.message || "Lỗi tạo task", loading: false });
      throw err;
    }
  },

  updateTask: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      await updateTaskApi(id, payload);
      set({ loading: false });
      const { pagination, fetchTasks } = get();
      fetchTasks({ page: pagination.page });
    } catch (err) {
      set({ error: err?.message || "Lỗi cập nhật task", loading: false });
      throw err;
    }
  },

  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteTaskApi(id);
      set({ loading: false });
      const { pagination, fetchTasks } = get();
      fetchTasks({ page: pagination.page });
    } catch (err) {
      set({ error: err?.message || "Lỗi xoá task", loading: false });
      throw err;
    }
  },

  assignTaskToFarmer: async (taskId, farmerId) => {
    set({ loading: true, error: null });
    try {
      await assignTaskToFarmerApi(taskId, farmerId);
      set({ loading: false });
    } catch (err) {
      set({ error: err?.message || "Lỗi gán task", loading: false });
      throw err;
    }
  },

  // Farmer methods
  fetchTasksFarmer: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await getAssignedTasksApi(params);
      set({
        tasks: res.data,
        pagination: {
          page: res.page,
          total: res.total,
          pageSize: res.pageSize,
        },
        loading: false,
      });
    } catch (err) {
      set({
        error: err?.message || "Lỗi tải danh sách công việc",
        loading: false,
      });
    }
  },

  fetchAssignedTaskDetail: async (id) => {
    set({ loading: true });
    try {
      const { data } = await getAssignedTaskDetail(id);
      set({ myTask: data, loading: false });
    } catch (e) {
      set({ myTask: null, loading: false, error: e?.message });
    }
  },

  createDailyNote: async (taskId, formData) => {
    try {
      return await createDailyNoteApi(taskId, formData);
    } catch (err) {
      set({ error: err?.message });
      throw err;
    }
  },
}));
