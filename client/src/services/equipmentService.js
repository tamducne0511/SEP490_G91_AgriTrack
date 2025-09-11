import { client } from "@/configs";

/**
 * Lấy danh sách thiết bị với filter/pagination.
 */
export const fetchEquipmentsApi = async (params = {}) => {
  const res = await client.get("/admin/equipments", { params });
  return res.data;
};

/**
 * Tạo mới thiết bị. Tự động chuyển payload sang FormData để hỗ trợ upload ảnh.
 */
export const createEquipmentApi = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  const res = await client.post("/admin/equipments", formData);
  return res.data;
};

/**
 * Cập nhật thiết bị theo id, dùng FormData để hỗ trợ upload ảnh.
 */
export const updateEquipmentApi = async (id, payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  const res = await client.put(`/admin/equipments/${id}`, formData);
  return res.data;
};

/**
 * Xoá thiết bị theo id.
 * @param {string} id
 * @returns {Promise<any>}
 */
export const deleteEquipmentApi = async (id) => {
  const res = await client.delete(`/admin/equipments/${id}`);
  return res.data;
};

/**
 * Lấy chi tiết thiết bị theo id.
 * @param {string} id
 * @returns {Promise<any>}
 */
export const fetchEquipmentDetailApi = async (id) => {
  const res = await client.get(`/admin/equipments/${id}`);
  return res.data;
};

/**
 * Tạo bản ghi thay đổi thiết bị (nhập/xuất...).
 * @param {{equipmentId:string,type:"import"|"export",quantity:number,price:number}} payload
 */
export const createEquipmentChangeApi = async (payload) => {
  const res = await client.post("/admin/equipment-changes", payload);
  return res.data;
};

/**
 * Lấy danh sách thay đổi thiết bị (nhập/xuất) với filter/pagination.
 */
export const fetchEquipmentChangesApi = async (params = {}) => {
  const res = await client.get("/admin/equipment-changes", { params });
  return res.data;
};

/** Phê duyệt thay đổi thiết bị theo id. */
export const approveEquipmentChangeApi = async (id) => {
  const res = await client.get(`/admin/equipment-changes/${id}/approve`);
  return res.data;
};

/** Từ chối thay đổi thiết bị theo id, kèm lý do. */
export const rejectEquipmentChangeApi = async (id, reason) => {
  const res = await client.post(`/admin/equipment-changes/${id}/reject`, { reason });
  return res.data;
};
