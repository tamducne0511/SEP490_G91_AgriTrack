import { client } from "@/configs";

// GET list farmers
export const fetchFarmersApi = async (params = {}) => {
  const res = await client.get("/admin/users/farmers", { params });
  return res.data;
};

// CREATE farmer
export const createFarmerApi = async (payload) => {
  const res = await client.post("/admin/users/farmers", payload);
  return res.data;
};

// UPDATE farmer
export const updateFarmerApi = async (id, payload) => {
  const res = await client.put(`/admin/users/farmers/${id}`, payload);
  return res.data;
};

// DELETE farmer
export const deleteFarmerApi = async (id) => {
  const res = await client.delete(`/admin/users/farmers/${id}`);
  return res.data;
};

// ASSIGN farmer to garden
export const assignFarmerToGardenApi = async ({ gardenId, farmerId }) => {
  const res = await client.post("/admin/users/garden/assign", {
    gardenId,
    farmerId,
  });
  return res.data;
};