import { create } from "zustand";
import {
  fetchFarmSchedulesApi,
  fetchFarmScheduleDetailApi,
  createFarmScheduleApi,
  updateFarmScheduleApi,
  deleteFarmScheduleApi,
} from "@/services/farmScheduleService";

export const useFarmScheduleStore = create((set) => ({
  schedules: [],
  scheduleDetail: null, // Dữ liệu chi tiết lịch
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,

  fetchSchedules: async (farmId) => {
    set({ loading: true, error: null });
    try {
      const res = await fetchFarmSchedulesApi(farmId);
      set({ schedules: res.data || [], loading: false });
    } catch (err) {
      set({ error: err?.message || "Lỗi tải lịch trang trại", loading: false });
    }
  },

  fetchScheduleDetail: async (scheduleId) => {
    set({ loading: true, error: null });
    try {
      const res = await fetchFarmScheduleDetailApi(scheduleId);
      set({ scheduleDetail: res.data, loading: false });
    } catch (err) {
      set({ error: err?.message || "Lỗi tải chi tiết lịch", loading: false });
    }
  },

  createSchedule: async (formData) => {
    set({ creating: true, error: null });
    try {
      await createFarmScheduleApi(formData);
      set({ creating: false });
    } catch (err) {
      set({ error: err?.message || "Lỗi tạo lịch", creating: false });
      throw err;
    }
  },

  updateSchedule: async (scheduleId, formData) => {
    set({ updating: true, error: null });
    try {
      await updateFarmScheduleApi(scheduleId, formData);
      set({ updating: false });
    } catch (err) {
      set({ error: err?.message || "Lỗi cập nhật lịch", updating: false });
      throw err;
    }
  },

  deleteSchedule: async (scheduleId) => {
    set({ deleting: true, error: null });
    try {
      await deleteFarmScheduleApi(scheduleId);
      set({ deleting: false });
    } catch (err) {
      set({ error: err?.message || "Lỗi xoá lịch", deleting: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
