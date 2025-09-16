import { client } from "@/configs";

// Lấy danh sách tất cả vườn với các tham số lọc tùy chọn
export const fetchGardensApi = async (params = {}) => {
  const res = await client.get("/admin/gardens", { params });
  return res.data;
};

// Lấy thông tin chi tiết của 1 vườn cụ thể theo ID
export const fetchGardenDetailApi = async (id) => {
  const res = await client.get(`/admin/gardens/${id}`);
  return res.data;
};

// Tạo vườn với dư liệu form
export const createGardenApi = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "image" && value instanceof File) {
      formData.append("image", value);
    } else {
      formData.append(key, value);
    }
  });
  const res = await client.post("/admin/gardens", formData);
  return res.data;
};

// Cập nhật thông tin vườn theo ID
export const updateGardenApi = async (id, payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "image" && value instanceof File) {
      formData.append("image", value);
    } else {
      formData.append(key, value);
    }
  });
  const res = await client.put(`/admin/gardens/${id}`, formData);
  return res.data;
};

// Xóa một vườn theo ID
export const deleteGardenApi = async (id) => {
  const res = await client.delete(`/admin/gardens/${id}`);
  return res.data;
};

// Tạo tự động các zone cho một vườn
export const generateZonesApi = async (gardenId, payload) => {
  const res = await client.post(`/admin/zones/generate/${gardenId}`, payload);
  return res.data;
};

// Lấy danh sách các zones thuộc về một vườn
export const fetchZonesByGardenIdApi = async (gardenId) => {
  const res = await client.get(`/admin/zones/list/${gardenId}`);
  return res.data;
};

// Tạo tự động các trees (cây) cho một vườn
export const generateTreesApi = async (gardenId, payload) => {
  const res = await client.post(`/admin/trees/generate/${gardenId}`, payload);
  return res.data;
};

// Lấy danh sách các trees thuộc về một vườn
export const fetchTreesByGardenIdApi = async (gardenId) => {
  const res = await client.get(`/admin/trees/list/${gardenId}`);
  return res.data;
};

// Lấy danh sách các vườn thuộc về một farm
export const fetchGardensByFarmIdApi = async (farmId, params = {}) => {
  // Đúng endpoint API bạn đã gửi ảnh: /admin/gardens/farm/:farmId
  const res = await client.get(`/admin/gardens/farm/${farmId}`, { params });
  return res.data;
};

// Lấy thông tin chi tiết của một tree cụ thể
export const fetchTreeDetailApi = async (treeId) => {
  const res = await client.get(`/admin/trees/${treeId}`);
  return res.data;
};
