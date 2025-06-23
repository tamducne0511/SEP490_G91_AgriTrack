import { client } from "@/configs";

export const loginApi = async ({ email, password }) => {
  const res = await client.post("/auth/login", { email, password });
  return res.data;
};

export const updateProfileApi = async (payload) => {
  const res = await client.post("/auth/update-profile", payload);
  return res.data;
};

export const changePasswordApi = async (payload) => {
  const res = await client.post("/auth/change-password", payload);
  return res.data;
};

export const getMeApi = async () => {
  const res = await client.get("/auth/me");
  return res.data;
};
