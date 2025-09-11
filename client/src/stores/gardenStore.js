import { create } from "zustand";
import {
  fetchGardensApi,
  fetchGardenDetailApi,
  createGardenApi,
  updateGardenApi,
  deleteGardenApi,
  generateZonesApi,
  fetchZonesByGardenIdApi,
  fetchTreesByGardenIdApi,
  generateTreesApi,
  fetchGardensByFarmIdApi,
} from "@/services";

export const useGardenStore = create((set, get) => ({
  gardens: [],
  gardenDetail: null,
  zones: [],
  pagination: { total: 0, page: 1, pageSize: 10 },
  loading: false,
  error: null,
  trees: [],
  gardensByFarm: [],
  loadingGardensByFarm: false,
  errorGardensByFarm: null,

  fetchGardensByFarmId: async (farmId, params = {}) => {
    set({ loadingGardensByFarm: true, errorGardensByFarm: null });
    try {
      const data = await fetchGardensByFarmIdApi(farmId, params);
      // data.data là array garden như API trả về
      set({
        gardensByFarm: data.data || [],
        loadingGardensByFarm: false,
      });
    } catch (err) {
      set({
        errorGardensByFarm: err?.message || "Lỗi tải danh sách vườn theo farm",
        gardensByFarm: [],
        loadingGardensByFarm: false,
      });
    }
  },

  fetchGardens: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchGardensApi(params);
      set({
        gardens: data.data || [],
        pagination: {
          total: data.totalItem || 0,
          page: data.page || 1,
          pageSize: params.pageSize || 10,
        },
        loading: false,
      });
    } catch (err) {
      set({ error: err?.message || "Lỗi tải danh sách vườn", loading: false });
    }
  },

  getGardenDetail: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchGardenDetailApi(id);
      set({
        gardenDetail: { ...data.data._doc, tasks: data.data.tasks } || null,
        loading: false,
      });
    } catch (err) {
      set({ error: err?.message || "Lỗi tải chi tiết vườn", loading: false });
    }
  },

  fetchZonesByGardenId: async (gardenId) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchZonesByGardenIdApi(gardenId);
      set({ zones: data.data || [], loading: false });
    } catch (err) {
      set({ error: err?.message || "Lỗi tải danh sách zone", loading: false });
    }
  },
  fetchTreesByGardenId: async (gardenId) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchTreesByGardenIdApi(gardenId);
      set({ trees: data.data || [], loading: false });
    } catch (err) {
      set({ error: err?.message || "Lỗi tải danh sách cây", loading: false });
    }
  },

  generateZones: async (gardenId, payload) => {
    set({ loading: true, error: null });
    try {
      await generateZonesApi(gardenId, payload);
      set({ loading: false });
      const { fetchZonesByGardenId } = get();
      fetchZonesByGardenId(gardenId);
    } catch (err) {
      set({ error: err?.message || "Lỗi tạo zone", loading: false });
      throw err;
    }
  },

  generateTrees: async (gardenId, payload) => {
    set({ loading: true, error: null });
    try {
      await generateTreesApi(gardenId, payload);
      set({ loading: false });
      const { fetchTreesByGardenId } = get();
      fetchTreesByGardenId(gardenId);
    } catch (err) {
      set({ error: err?.message || "Lỗi tạo cây", loading: false });
      throw err;
    }
  },

  createGarden: async (payload) => {
    set({ loading: true, error: null });
    try {
      await createGardenApi(payload);
      set({ loading: false });
      const { pagination, fetchGardens } = get();
      fetchGardens({ page: pagination.page });
    } catch (err) {
      set({ error: err?.message || "Lỗi tạo vườn", loading: false });
      throw err;
    }
  },

  updateGarden: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      await updateGardenApi(id, payload);
      set({ loading: false });
      const { pagination, fetchGardens } = get();
      fetchGardens({ page: pagination.page });
    } catch (err) {
      set({ error: err?.message || "Lỗi cập nhật vườn", loading: false });
      throw err;
    }
  },

  deleteGarden: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteGardenApi(id);
      set({ loading: false });
      const { pagination, fetchGardens } = get();
      fetchGardens({ page: pagination.page });
    } catch (err) {
      set({ error: err?.message || "Lỗi xoá vườn", loading: false });
      throw err;
    }
  },
}));
