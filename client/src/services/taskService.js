import { client } from "@/configs";

// Lấy danh sách task (có thể filter theo gardenId)
export const fetchTasksApi = async (params = {}) => {
  const res = await client.get("/admin/tasks", { params });
  return res.data;
};

export const getTaskDetail = async (id) => {
  const res = await client.get(`/admin/tasks/${id}`);
  return res.data;
};

// Tạo mới task (có thể gửi FormData nếu có ảnh)
export const createTaskApi = async (payload) => {
  const res = await client.post("/admin/tasks", payload);
  return res.data;
};

// Update task
export const updateTaskApi = async (id, payload) => {
  const res = await client.put(`/admin/tasks/${id}`, payload);
  return res.data;
};

// Delete task
export const deleteTaskApi = async (id) => {
  const res = await client.delete(`/admin/tasks/${id}`);
  return res.data;
};

export const assignTaskToFarmerApi = async (taskId, farmerId) => {
  const res = await client.post(`/admin/tasks/${taskId}/assign-farmer`, {
    farmerId,
  });
  return res.data;
};

// Farmer
export const getAssignedTasksApi = async (params) => {
  const res = await client.get("/web/tasks", { params });
  return res.data;
};

export const getAssignedTaskDetail = async (id) => {
  const res = await client.get(`/web/tasks/${id}`);
  return res.data;
};

export const createDailyNoteApi = async (taskId, formData) => {
  const res = await client.post(`/web/tasks/${taskId}/daily-note`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const createQuestionApi = async (taskId, formData) => {
  const res = await client.post(`/web/tasks/${taskId}/questions`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const fetchFarmEquipmentApi = async (params = {}) => {
  const res = await client.get("/web/equipments", { params });
  return res.data;
};

export const changeTaskStatusApi = async (taskId, status) => {
  const res = await client.post(`/web/tasks/${taskId}/change-status`, {
    status,
  });
  return res.data;
};

export const fetchDailyNoteDetailApi = async (id) => {
  const res = await client.get(`/web/tasks/daily-note/${id}`);
  return res.data;
};

export const fetchDailyNotesByTaskIdApi = async (taskId) => {
  const res = await client.get(`/web/tasks/${taskId}/daily-note`);
  return res.data;
};
