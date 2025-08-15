import { client } from "@/configs";

export const loginApi = async ({ email, password }) => {
  console.log("🔍 AuthService: Making login API call to /auth/login");
  console.log("🔍 AuthService: Request payload:", { email, password: "***" });
  try {
    const res = await client.post("/auth/login", { email, password });
    console.log("🔍 AuthService: Login API success response:", res);
    return res.data;
  } catch (error) {
    console.error("❌ AuthService: Login API error:", error);
    throw error;
  }
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
  console.log("🔍 AuthService: Making getMe API call to /auth/me");
  try {
    const res = await client.get("/auth/me");
    console.log("🔍 AuthService: GetMe API success response:", res);
    return res.data;
  } catch (error) {
    console.error("❌ AuthService: GetMe API error:", error);
    throw error;
  }
};
