import { client } from "@/configs";

// Lấy danh sách notification
export const fetchNotificationsApi = async (params = {}) => {
  const res = await client.get("/admin/notifications", { params });
  return res.data;
};

// Tạo notification (form-data)
export const createNotificationApi = async (payload) => {
  const res = await client.post("/admin/notifications", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Cập nhật notification (form-data)
export const updateNotificationApi = async (id, payload) => {
  const res = await client.put(`/admin/notifications/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Xoá notification
export const deleteNotificationApi = async (id) => {
  const res = await client.delete(`/admin/notifications/${id}`);
  return res.data;
};
