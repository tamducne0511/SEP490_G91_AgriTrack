import {
  askAIQuestionApi,
  createTaskQuestionApi,
  fetchFarmTaskQuestionsApi,
  fetchQuestionsByTreeApi,
  fetchTaskQuestionDetailApi,
  fetchTreeDetailApi,
  fetchWeatherApi,
} from "@/services";
import { create } from "zustand";

export const useTaskQuestionStore = create((set) => ({
  questions: [],
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, pageSize: 20 },
  creating: false,
  createError: null,
  treeQuestions: [],
  loadingTreeQuestions: false,
  errorTreeQuestions: null,
  treeQuestionsPagination: { total: 0, page: 1, pageSize: 10 },
  aiAnswer: null,
  loadingAI: false,
  errorAI: null,
  weather: null,
  loadingWeather: false,
  errorWeather: null,
  taskQuestionDetail: null,
  loadingTaskQuestionDetail: false,
  errorTaskQuestionDetail: null,
  treeDetail: null,
  loadingTreeDetail: false,
  errorTreeDetail: null,

  fetchTreeDetail: async (treeId) => {
    set({ loadingTreeDetail: true, errorTreeDetail: null });
    try {
      const data = await fetchTreeDetailApi(treeId);
      set({ treeDetail: data.data, loadingTreeDetail: false });
    } catch (err) {
      set({
        errorTreeDetail: err?.message || "Lỗi tải chi tiết cây",
        treeDetail: null,
        loadingTreeDetail: false,
      });
    }
  },
  fetchTaskQuestionDetail: async (id) => {
    set({ loadingTaskQuestionDetail: true, errorTaskQuestionDetail: null });
    try {
      const res = await fetchTaskQuestionDetailApi(id);
      set({ taskQuestionDetail: res.data, loadingTaskQuestionDetail: false });
    } catch (err) {
      set({
        errorTaskQuestionDetail: err?.message || "Lỗi lấy chi tiết câu hỏi",
        loadingTaskQuestionDetail: false,
        taskQuestionDetail: null,
      });
    }
  },
  fetchWeather: async () => {
    set({ loadingWeather: true, errorWeather: null });
    try {
      const data = await fetchWeatherApi();
      set({ weather: data.data, loadingWeather: false });
      return data.data;
    } catch (err) {
      set({
        errorWeather: err?.message || "Lỗi lấy thời tiết",
        loadingWeather: false,
        weather: null,
      });
    }
  },

  askAI: async ({ textPrompt, imageUrl }) => {
    set({ loadingAI: true, errorAI: null });
    try {
      const res = await askAIQuestionApi({ textPrompt, imageUrl });
      set({ aiAnswer: res.data, loadingAI: false });
      return res.data;
    } catch (err) {
      set({
        errorAI: err?.message || "Lỗi gọi AI",
        loadingAI: false,
        aiAnswer: null,
      });
      throw err;
    }
  },
  clearAIAnswer: () => set({ aiAnswer: null, errorAI: null }),

  createQuestion: async (formData) => {
    set({ creating: true, createError: null });
    try {
      const res = await createTaskQuestionApi(formData);
      set({ creating: false });
      return res.data;
    } catch (err) {
      set({ createError: err?.message || "Lỗi gửi câu hỏi", creating: false });
      throw err;
    }
  },
  fetchQuestions: async (farmId, page = 1, keyword = "") => {
    set({ loading: true, error: null });
    try {
      const res = await fetchFarmTaskQuestionsApi(farmId, page, keyword);
      set({ 
        questions: res.data || [], 
        loading: false,
        pagination: {
          total: res.totalItem || 0,
          page: res.page || 1,
          pageSize: res.pageSize || 10,
        }
      });
    } catch (err) {
      set({
        error: err?.message || "Lỗi tải danh sách câu hỏi",
        loading: false,
        questions: [],
      });
    }
  },

  fetchQuestionsByTree: async (treeId, page = 1, keyword = "") => {
    set({ loadingTreeQuestions: true, errorTreeQuestions: null });
    try {
      const data = await fetchQuestionsByTreeApi(treeId, page, keyword);
      set({ 
        treeQuestions: data.data || [], 
        loadingTreeQuestions: false,
        treeQuestionsPagination: {
          total: data.totalItem || 0,
          page: data.page || 1,
          pageSize: data.pageSize || 10,
        }
      });
    } catch (err) {
      set({
        errorTreeQuestions: err?.message || "Lỗi tải câu hỏi của cây",
        loadingTreeQuestions: false,
      });
    }
  },
}));