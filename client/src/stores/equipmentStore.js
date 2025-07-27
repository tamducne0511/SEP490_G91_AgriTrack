import { create } from "zustand";
import {
  fetchEquipmentsApi,
  createEquipmentApi,
  updateEquipmentApi,
  deleteEquipmentApi,
  fetchEquipmentDetailApi,
  createEquipmentChangeApi,
  approveEquipmentChangeApi,
  rejectEquipmentChangeApi,
  fetchEquipmentChangesApi, // Import the equipment change API
} from "@/services"; // Update path if needed
import { message } from "antd";

export const useEquipmentStore = create((set, get) => ({
  equipments: [],
  pagination: { total: 0, page: 1, pageSize: 10 },
  loading: false,
  error: null,
  equipmentDetail: null, // Added state for storing equipment detail
  equipmentChanges: [],
  ecPagination: { total: 0, page: 1, pageSize: 10 },
  ecLoading: false,
  ecError: null,

  fetchEquipmentChanges: async (params = {}) => {
    set({ ecLoading: true, ecError: null });
    try {
      const data = await fetchEquipmentChangesApi(params);
      set({
        equipmentChanges: data.data || [],
        ecPagination: {
          total: data.totalItem || data.total || 0,
          page: data.page || 1,
          pageSize: params.pageSize || 10, // nếu backend không trả về pageSize
        },
        ecLoading: false,
      });
    } catch (err) {
      set({ ecError: err?.message || "Lỗi tải danh sách thay đổi thiết bị", ecLoading: false });
    }
  },

  // Approve equipment change
  approveEquipmentChange: async (id) => {
    set({ ecLoading: true, ecError: null });
    try {
      await approveEquipmentChangeApi(id);
      set({ ecLoading: false });
      const { ecPagination, fetchEquipmentChanges } = get();
      fetchEquipmentChanges({ page: ecPagination.page, pageSize: ecPagination.pageSize });
    } catch (err) {
      set({ ecError: err?.message || "Lỗi duyệt thay đổi thiết bị", ecLoading: false });
      throw err;
    }
  },

  // Reject equipment change
  rejectEquipmentChange: async (id, reason) => {
    set({ ecLoading: true, ecError: null });
    try {
      await rejectEquipmentChangeApi(id, reason);
      set({ ecLoading: false });
      const { ecPagination, fetchEquipmentChanges } = get();
      fetchEquipmentChanges({ page: ecPagination.page, pageSize: ecPagination.pageSize });
    } catch (err) {
      set({ ecError: err?.message || "Lỗi từ chối thay đổi thiết bị", ecLoading: false });
      throw err;
    }
  },
  // Fetch equipment list
  fetchEquipments: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchEquipmentsApi(params);
      set({
        equipments: data.data || [],
        pagination: {
          total: data.total || data.pagination?.total || 0,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
        },
        loading: false,
      });
    } catch (err) {
      set({ error: err?.message || "Lỗi tải thiết bị", loading: false });
    }
  },

  // Fetch equipment details by ID
  fetchEquipmentDetail: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchEquipmentDetailApi(id);
      set({
        equipmentDetail: data.data || {}, // Store equipment details in the state
        loading: false,
      });
    } catch (err) {
      set({
        error: err?.message || "Lỗi tải chi tiết thiết bị",
        loading: false,
      });
    }
  },

  // Create a new equipment
  createEquipment: async (payload) => {
    set({ loading: true, error: null });
    try {
      await createEquipmentApi(payload);
      set({ loading: false });
      const { pagination, fetchEquipments } = get();
      fetchEquipments({ page: pagination.page, pageSize: pagination.pageSize });
    } catch (err) {
      set({ error: err?.message || "Lỗi tạo thiết bị", loading: false });
      throw err;
    }
  },

  // Update an equipment
  updateEquipment: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      await updateEquipmentApi(id, payload);
      set({ loading: false });
      const { pagination, fetchEquipments } = get();
      fetchEquipments({ page: pagination.page, pageSize: pagination.pageSize });
    } catch (err) {
      set({ error: err?.message || "Lỗi cập nhật thiết bị", loading: false });
      throw err;
    }
  },

  // Delete an equipment
  deleteEquipment: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteEquipmentApi(id);
      set({ loading: false });
      const { pagination, fetchEquipments } = get();
      fetchEquipments({ page: pagination.page, pageSize: pagination.pageSize });
    } catch (err) {
      set({ error: err?.message || "Lỗi xoá thiết bị", loading: false });
      throw err;
    }
  },

  // Import equipment
  importEquipments: async (payload) => {
    set({ loading: true, error: null });
    try {
      // Log the import in the equipment-change endpoint
      await createEquipmentChangeApi({
        equipmentId: payload.equipmentId,
        type: "import",
        quantity: payload.quantity,
        price: payload.price,
      });
      set({ loading: false });
      message.success("Tạo đơn nhập thiết bị thành công");
    } catch (err) {
      set({ error: err?.message || "Lỗi nhập thiết bị", loading: false });
      throw err;
    }
  },

  // Export equipment
  exportEquipments: async (payload) => {
    set({ loading: true, error: null });
    try {
      // Log the export in the equipment-change endpoint
      await createEquipmentChangeApi({
        equipmentId: payload.equipmentId,
        type: "export",
        quantity: payload.quantity,
        price: payload.price,
      });
      message.success("Tạo đơn xuất thiết bị thành công");
      set({ loading: false });
    } catch (err) {
      set({ error: err?.message || "Lỗi xuất thiết bị", loading: false });
    }
  },
}));
