import { client } from "@/configs";

// Lấy danh sách farm
export const fetchFarmsApi = async (params = {}) => {
  const res = await client.get("/admin/farms", { params });
  return res.data;
};

// Tạo farm mới (formData)
export const createFarmApi = async (payload) => {
  // payload: { name, description, address, image }
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.append(key, value);
  });
  const res = await client.post("/admin/farms", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Xóa farm
export const deleteFarmApi = async (id) => {
  const res = await client.delete(`/admin/farms/${id}`);
  return res.data;
};

export const updateFarmApi = async (id, payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.append(key, value);
  });
  const res = await client.put(`/admin/farms/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getFarmDetail = async (id) => {
  const res = await client.get(`/admin/farms/${id}`);
  return res.data;
};
