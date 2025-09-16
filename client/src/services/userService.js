import { client } from "@/configs";

// GET list users by role (hoặc tất cả nếu không truyền role)
export const fetchUsersApi = async (params = {}) => {
  const res = await client.get("/admin/users", { params });
  return res.data;
};

// Tạo mới user với role động
export const createUserApi = async (payload) => {
  const res = await client.post("/admin/users", payload);
  return res.data;
};

// Chỉnh sửa user
export const updateUserApi = async (id, payload) => {
  const res = await client.put(`/admin/users/${id}`, payload);
  return res.data;
};

// Xóa user
export const deleteUserApi = async (id) => {
  const res = await client.post(`/admin/users/${id}/deactive`);
  return res.data;
};

// Kích hoạt lại user
export const activeUserApi = async (id) => {
  const res = await client.post(`/admin/users/${id}/active`);
  return res.data;
};

// Gán user vào farm
export const assignUserToFarmApi = async ({ farmId, userId }) => {
  const res = await client.post("/admin/users/farm/assign", { farmId, userId });
  return res.data;
};

// Lấy chi tiết user
export const fetchUserDetailApi = async (id) => {
  const res = await client.get(`/admin/users/${id}`);
  return res.data;
};

// Lấy danh sách farm đã gán cho expert
export const getListFarmAssignedExpert = async (id) => {
  const res = await client.get(`/admin/users/assign/expert-to-farm/${id}`);
  return res.data;
};

// Gán expert vào farm
export const assignExpertToFarmApi = async ({ expertId, farmId }) => {
  const res = await client.post("/admin/users/assign/expert-to-farm", {
    expertId,
    farmId,
  });
  return res.data;
};

// Hủy gán expert khỏi farm
export const unassignExpertFromFarmApi = async (assignedFarmId) => {
  const res = await client.delete(
    `/admin/users/unassign/expert-to-farm/${assignedFarmId}`
  );
  return res.data;
};

// Đổi mật khẩu 
export const adminChangePasswordApi = async (id, payload) => {
  const res = await client.post(`/admin/users/${id}/change-password`, payload);
  return res.data;
};
