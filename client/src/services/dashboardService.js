import { client } from "@/configs";

export const getDashboardData = async (params) => {
  const response = await client.get("/admin/dashboards", { params });
  return response.data;
};
