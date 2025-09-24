import { create } from "zustand";
import {
  createNewsApi,
  deleteNewsApi,
  getAllNewsApi,
  getNewsByIdApi,
  getMyNewsApi,
  updateNewsApi,
  getPublishedNewsApi,
} from "@/services";

export const useNewsStore = create((set, get) => ({
  news: [],
  currentNews: null,
  myNews: [],
  publishedNews: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },

  // Get all news with filters
  fetchNews: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      // Use real API
      const response = await getAllNewsApi(filters);
      const { data, pagination } = response;
      
      set({ 
        news: Array.isArray(data) ? data : [], 
        pagination,
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err?.message || "Failed to fetch news", 
        loading: false,
        news: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        }
      });
    }
  },

  // Get news by ID
  fetchNewsById: async (id) => {
    set({ loading: true, error: null });
    try {
      // Use real API
      const response = await getNewsByIdApi(id);
      set({ 
        currentNews: response.data, 
        loading: false 
      });
      return response.data;
    } catch (err) {
      set({ 
        error: err?.message || "Failed to fetch news details", 
        loading: false 
      });
      throw err;
    }
  },

  // Create new news
  createNews: async (newsData) => {
    set({ loading: true, error: null });
    try {
      // Use real API
      const response = await createNewsApi(newsData);
      const newNews = response.data;
      
      // Add to news list
      const { news } = get();
      set({ 
        news: [newNews, ...(news || [])],
        loading: false 
      });
      
      return newNews;
    } catch (err) {
      set({ 
        error: err?.message || "Failed to create news", 
        loading: false 
      });
      throw err;
    }
  },

  // Update news
  updateNews: async (id, newsData) => {
    set({ loading: true, error: null });
    try {
      const response = await updateNewsApi(id, newsData);
      const updatedNews = response.data;
      
      // Update in news list
      const { news } = get();
      const updatedNewsList = (news || []).map(item => 
        item._id === id ? updatedNews : item
      );
      
      set({ 
        news: updatedNewsList,
        currentNews: updatedNews,
        loading: false 
      });
      
      return updatedNews;
    } catch (err) {
      set({ 
        error: err?.message || "Failed to update news", 
        loading: false 
      });
      throw err;
    }
  },

  // Delete news
  deleteNews: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteNewsApi(id);
      
      // Remove from news list
      const { news } = get();
      const filteredNews = (news || []).filter(item => item._id !== id);
      
      set({ 
        news: filteredNews,
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err?.message || "Failed to delete news", 
        loading: false 
      });
      throw err;
    }
  },

  // Get my news (for experts)
  fetchMyNews: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await getMyNewsApi(filters);
      const { data, pagination } = response;
      set({ 
        myNews: data, 
        pagination,
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err?.message || "Failed to fetch your news", 
        loading: false 
      });
    }
  },

  // Get published news
  fetchPublishedNews: async (limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await getPublishedNewsApi(limit);
      set({ 
        publishedNews: response.data, 
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err?.message || "Failed to fetch published news", 
        loading: false 
      });
    }
  },

  // Clear current news
  clearCurrentNews: () => {
    set({ currentNews: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      news: [],
      currentNews: null,
      myNews: [],
      publishedNews: [],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
    });
  },

}));
