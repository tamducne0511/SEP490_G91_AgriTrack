import { client } from "@/configs";

// Lấy list schedule theo farmId
export const fetchFarmSchedulesApi = async (farmId) => {
  const res = await client.get("/farm-schedules", {
    params: { farmId },
  });
  return res.data;
};

// Lấy chi tiết schedule theo scheduleId
export const fetchFarmScheduleDetailApi = async (scheduleId) => {
  const res = await client.get(`/farm-schedules/${scheduleId}`);
  return res.data;
};

// Tạo mới schedule cho farm
export const createFarmScheduleApi = async (formData) => {
  const res = await client.post("/farm-schedules", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Cập nhật schedule (by id)
export const updateFarmScheduleApi = async (scheduleId, formData) => {
  const res = await client.put(`/farm-schedules/${scheduleId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Xóa schedule (nếu cần)
export const deleteFarmScheduleApi = async (scheduleId) => {
  const res = await client.delete(`/farm-schedules/${scheduleId}`);
  return res.data;
};

// Gợi ý tên: farmScheduleService.js
export const generateTasksFromScheduleApi = async (scheduleId, gardenId) => {
  const res = await client.post("/farm-schedules/generate", { scheduleId, gardenId });
  return res.data; // { message, data: Task[] }
};
