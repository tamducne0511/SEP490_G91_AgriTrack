import { client } from "@/configs";

export const fetchEquipmentsApi = async (params = {}) => {
  const res = await client.get("/admin/equipments", { params });
  return res.data;
};

export const createEquipmentApi = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  const res = await client.post("/admin/equipments", formData);
  return res.data;
};

export const updateEquipmentApi = async (id, payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  const res = await client.put(`/admin/equipments/${id}`, formData);
  return res.data;
};

export const deleteEquipmentApi = async (id) => {
  const res = await client.delete(`/admin/equipments/${id}`);
  return res.data;
};

export const fetchEquipmentDetailApi = async (id) => {
  const res = await client.get(`/admin/equipments/${id}`);
  return res.data;
};

export const createEquipmentChangeApi = async (payload) => {
  const res = await client.post("/admin/equipment-changes", payload);
  return res.data;
};

// List equipment changes
export const fetchEquipmentChangesApi = async (params = {}) => {
  const res = await client.get("/admin/equipment-changes", { params });
  return res.data;
};

// Approve equipment change
export const approveEquipmentChangeApi = async (id) => {
  const res = await client.get(`/admin/equipment-changes/${id}/approve`);
  return res.data;
};

// Reject equipment change
export const rejectEquipmentChangeApi = async (id, reason) => {
  const res = await client.post(`/admin/equipment-changes/${id}/reject`, { reason });
  return res.data;
};
