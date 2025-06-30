import { create } from "zustand";
import { fetchTasksApi, assignTaskToFarmerApi } from "@/services";

export const useTaskStore = create((set) => ({
  tasks: [],
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
}));
