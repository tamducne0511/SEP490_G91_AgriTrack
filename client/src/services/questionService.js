import { client } from "@/configs";

export const fetchFarmTaskQuestionsApi = async (farmId, page = 1, keyword = "") => {
  const res = await client.get("/task-questions", {
    params: { farmId, page, keyword },
  });
  return res.data;
};

export const createTaskQuestionApi = async (formData) => {
  const res = await client.post("/task-questions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const fetchQuestionsByTreeApi = async (treeId, page = 1, keyword = "") => {
  const res = await client.get(`/task-questions/tree/${treeId}`, {
    params: { page, keyword },
  });
  return res.data;
};

export const askAIQuestionApi = async ({ textPrompt, imageUrl }) => {
  const res = await client.post("/task-questions/ask-ai", {
    textPrompt,
    imageUrl,
  });
  return res.data;
};

export const createNotificationQuesApi = async ({ questionId,title,content }) => {
  const res = await client.post("/question-notifications", {
    questionId,title,content
  });
  return res.data;
};

export const fetchWeatherApi = async (location) => {
  const params = location ? { location } : {};
  const res = await client.get("/task-questions/weather/get", { params });
  return res.data;
};

export const fetchTaskQuestionDetailApi = async (id) => {
  const res = await client.get(`/task-questions/${id}`);
  return res.data;
};
