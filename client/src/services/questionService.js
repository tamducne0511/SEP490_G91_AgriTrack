import { client } from "@/configs";

export const fetchFarmTaskQuestionsApi = async (farmId) => {
  const res = await client.get("/task-questions", {
    params: { farmId },
  });
  return res.data;
};

export const createTaskQuestionApi = async (formData) => {
  const res = await client.post("/task-questions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const fetchQuestionsByTreeApi = async (treeId) => {
  const res = await client.get(`/task-questions/tree/${treeId}`);
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

export const fetchWeatherApi = async () => {
  const res = await client.get("/task-questions/weather/get");
  return res.data;
};

export const fetchTaskQuestionDetailApi = async (id) => {
  const res = await client.get(`/task-questions/${id}`);
  return res.data;
};
