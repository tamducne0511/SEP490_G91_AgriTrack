import { client } from "@/configs";

// Lấy danh sách notification
export const fetchNotificationsApi = async (params = {}) => {
  const res = await client.get("/notifications", { params });
  return res.data;
};

export const fetchNotificationsQuesApi = async (id, params = {}) => {
  const res = await client.get(`/question-notifications/${id}`, { params });
  return res.data;
};

export const fetchNotificationsExpertQuesApi = async (params = {}) => {
  const { farmId, ...rest } = params;
  const res = await client.get(`/question-notifications/`, {
    params,
  });
  return res.data;
};

export const fetchNotificationsExpertApi = async (params = {}) => {
  const { farmId, ...rest } = params;
  const res = await client.get(`/notifications/expert/${farmId}`, {
    params: rest,
  });
  return res.data;
};

// Tạo notification (form-data)
export const createNotificationApi = async (payload) => {
  const res = await client.post("/notifications", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Cập nhật notification (form-data)
export const updateNotificationApi = async (id, payload) => {
  const res = await client.put(`/notifications/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Xoá notification
export const deleteNotificationApi = async (id) => {
  const res = await client.delete(`/notifications/${id}`);
  return res.data;
};

export const fetchNotificationDetailApi = async (id) => {
  const res = await client.get(`/notifications/${id}`);
  return res.data;
};

export const fetchTotalNotiUnread = async () => {
  const res = await client.get(`/notifications/unread/total`);
  return res.data;
};

export const markNotificationAsRead = async (id) => {
  const res = await client.get(`/notifications/${id}/mark-read`);
  return res.data;
}
export const fetchTotalQuesNotiUnread = async () => {
  const res = await client.get(`/question-notifications/unread/total`);
  return res.data;
};

export const marQueskNotificationAsRead = async (id) => {
  const res = await client.get(`/question-notifications/${id}/mark-read`);
  return res.data;
}