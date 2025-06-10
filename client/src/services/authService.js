import { client } from "@/configs";

export const loginApi = async ({ email, password }) => {
  const res = await client.post("/admin/auth/login", { email, password });
  return res.data;
};
