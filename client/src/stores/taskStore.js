import {
  fetchTasksApi,
  getTaskDetail,
  assignTaskToFarmerApi,
  changeTaskStatusApi,
} from "@/services";
import { create } from "zustand";

export const useTaskStore = create((set, get) => ({
  tasks: [],
  taskDetail: null,
  loading: false,
  error: null,

  fetchTasks: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchTasksApi(params);
      set({
        tasks: data.data || [],
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

  changeTaskStatus: async (taskId, status) => {
    set({ loading: true, error: null });
    try {
      await changeTaskStatusApi(taskId, status);
      set({ loading: false });
      const { fetchTaskDetail } = get();
      fetchTaskDetail(taskId);
    } catch (err) {
      set({ error: err?.message || "Lỗi đổi trạng thái task", loading: false });
      throw err;
    }
  },
}));
