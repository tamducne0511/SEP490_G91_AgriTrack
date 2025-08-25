// taskStore.js
import {
  assignTaskToFarmerApi,
  changeTaskStatusApi,
  createDailyNoteApi,
  createQuestionApi,
  createTaskApi,
  deleteTaskApi,
  fetchDailyNoteDetailApi,
  fetchDailyNotesByTaskIdApi,
  fetchFarmEquipmentApi,
  fetchTasksApi,
  getAssignedTaskDetail,
  getAssignedTasksApi,
  getTaskDetail,
  updateTaskApi,
} from "@/services";
import { create } from "zustand";

export const useTaskStore = create((set, get) => ({
  tasks: [],
  pagination: { total: 0, page: 1, pageSize: 10 },
  loading: false,
  error: null,
  taskDetail: null,
  myTask: null,
  equipmentList: [],
  dailyNoteDetail: null,
  fetchDailyNoteDetail: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetchDailyNoteDetailApi(id);
      set({ dailyNoteDetail: res.data, loading: false }); // Lưu cả taskDailyNote & equipments
      return res.data;
    } catch (err) {
      set({
        error: err?.message || "Lỗi lấy chi tiết ghi chú",
        loading: false,
        dailyNoteDetail: null,
      });
      throw err;
    }
  },

  fetchDailyNotesByTaskId: async (taskId) => {
    set({ loading: true, error: null });
    try {
      const res = await fetchDailyNotesByTaskIdApi(taskId);
      set({ loading: false });
      return res.data;
    } catch (err) {
      set({
        error: err?.message || "Lỗi lấy danh sách ghi chú",
        loading: false,
      });
      throw err;
    }
  },
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
      const { fetchTaskDetail } = get();
      fetchTaskDetail(id);
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

  fetchFarmEquipment: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchFarmEquipmentApi({...params, status: 1});
      set({ equipmentList: data.data || [], loading: false });
    } catch (err) {
      set({
        error: err?.message || "Lỗi tải danh sách thiết bị",
        loading: false,
      });
    }
  },

  createQuestion: async (taskId, formData) => {
    try {
      return await createQuestionApi(taskId, formData);
    } catch (err) {
      set({ error: err?.message });
      throw err;
    }
  },

  changeTaskStatus: async (taskId, status) => {
    set({ loading: true, error: null });
    try {
      await changeTaskStatusApi(taskId, status);
      set({ loading: false });
      // Optionally, reload task detail nếu muốn tự động update view
      const { fetchAssignedTaskDetail } = get();
      fetchAssignedTaskDetail(taskId);
    } catch (err) {
      set({ error: err?.message || "Lỗi đổi trạng thái task", loading: false });
      throw err;
    }
  },
}));
