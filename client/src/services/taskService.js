import { client } from "@/configs";

// Lấy danh sách task (có thể filter theo gardenId)
export const fetchTasksApi = async (params = {}) => {
  const res = await client.get("/admin/tasks", { params });
  return res.data;
};

// Lấy chi tiết 1 task
export const getTaskDetail = async (id) => {
  const res = await client.get(`/admin/tasks/${id}`);
  return res.data;
};

// Gán task cho farmer
export const assignTaskToFarmerApi = async (taskId, farmerId) => {
  const res = await client.post(`/admin/tasks/${taskId}/assign-farmer`, {
    farmerId,
  });
  return res.data;
};

// Đổi trạng thái task (cho farmer)
export const changeTaskStatusApi = async (taskId, status) => {
  const res = await client.post(`/web/tasks/${taskId}/change-status`, { status });
  return res.data;
};
