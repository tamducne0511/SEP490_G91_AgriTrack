import { client } from "@/configs";

// GET list users by role (hoặc tất cả nếu không truyền role)
export const fetchUsersApi = async (params = {}) => {
  const res = await client.get("/admin/users", { params });
  return res.data;
};

// CREATE user với role động
export const createUserApi = async (payload) => {
  const res = await client.post("/admin/users", payload);
  return res.data;
};

// UPDATE user
export const updateUserApi = async (id, payload) => {
  const res = await client.put(`/admin/users/${id}`, payload);
  return res.data;
};

// DELETE user
export const deleteUserApi = async (id) => {
  const res = await client.delete(`/admin/users/${id}`);
  return res.data;
};

// ASSIGN user to farm
export const assignUserToFarmApi = async ({ farmId, userId }) => {
  const res = await client.post("/admin/users/farm/assign", { farmId, userId });
  return res.data;
};

export const fetchUserDetailApi = async (id) => {
  const res = await client.get(`/admin/users/${id}`);
  return res.data;
};

// Expert
export const getListFarmAssignedExpert = async (id) => {
  const res = await client.get(`/admin/users/assign/expert-to-farm/${id}`);
  return res.data;
};

export const assignExpertToFarmApi = async ({ expertId, farmId }) => {
  const res = await client.post("/admin/users/assign/expert-to-farm", {
    expertId,
    farmId,
  });
  return res.data;
};

export const unassignExpertFromFarmApi = async (assignedFarmId) => {
  const res = await client.delete(
    `/admin/users/unassign/expert-to-farm/${assignedFarmId}`
  );
  return res.data;
};