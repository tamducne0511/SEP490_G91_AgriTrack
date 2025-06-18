import { client } from "@/configs";

export const fetchGardensApi = async (params = {}) => {
  const res = await client.get("/admin/gardens", { params });
  return res.data;
};

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

export const deleteGardenApi = async (id) => {
  const res = await client.delete(`/admin/gardens/${id}`);
  return res.data;
};
