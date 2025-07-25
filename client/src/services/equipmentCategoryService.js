import { client } from "@/configs";

// Fetch all equipment categories
export const fetchEquipmentCategoriesApi = async (params = {}) => {
  const res = await client.get("/admin/equipment-categories", { params });
  return res.data;
};

// Create a new equipment category
export const createEquipmentCategoryApi = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  const res = await client.post("/admin/equipment-categories", formData);
  return res.data;
};

// Update an existing equipment category
export const updateEquipmentCategoryApi = async (id, payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  const res = await client.put(`/admin/equipment-categories/${id}`, formData);
  return res.data;
};

// Delete an equipment category
export const deleteEquipmentCategoryApi = async (id) => {
  const res = await client.delete(`/admin/equipment-categories/${id}`);
  return res.data;
};

// Fetch details of a specific category
export const fetchCategoryDetailApi = async (id) => {
  const res = await client.get(`/admin/equipment-categories/${id}`);
  return res.data;
};
