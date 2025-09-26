import { client } from "@/configs";

// Get all news with filters
export const getAllNewsApi = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });
  
  const queryString = params.toString();
  const url = queryString ? `/admin/news?${queryString}` : '/admin/news';
  
  const response = await client.get(url);
  return response.data;
};

// Get news by ID
export const getNewsByIdApi = async (id) => {
  const response = await client.get(`/admin/news/${id}`);
  return response.data;
};

// Create new news
export const createNewsApi = async (newsData) => {
  const formData = new FormData();
  
  // Add text fields
  formData.append('title', newsData.title);
  formData.append('content', newsData.content);
  if (newsData.status) {
    formData.append('status', newsData.status);
  }
  
  // Add image if provided
  if (newsData.image && newsData.image instanceof File) {
    formData.append('image', newsData.image);
  }
  
  const response = await client.post('/admin/news', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Update news
export const updateNewsApi = async (id, newsData) => {
  const formData = new FormData();
  
  // Add text fields
  if (newsData.title) formData.append('title', newsData.title);
  if (newsData.content) formData.append('content', newsData.content);
  if (newsData.status) formData.append('status', newsData.status);
  if (typeof newsData.removeImage === 'boolean') formData.append('removeImage', String(newsData.removeImage));
  
  // Add image if provided
  if (newsData.image && newsData.image instanceof File) {
    formData.append('image', newsData.image);
  }
  
  const response = await client.put(`/admin/news/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Delete news
export const deleteNewsApi = async (id) => {
  const response = await client.delete(`/admin/news/${id}`);
  return response.data;
};

// Get my news (for experts)
export const getMyNewsApi = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });
  
  const queryString = params.toString();
  const url = queryString ? `/admin/news/my/news?${queryString}` : '/admin/news/my/news';
  
  const response = await client.get(url);
  return response.data;
};

// Get published news
export const getPublishedNewsApi = async (limit = 10) => {
  const response = await client.get(`/admin/news/published?limit=${limit}`);
  return response.data;
};

// Get news by status
export const getNewsByStatusApi = async (status) => {
  const response = await client.get(`/admin/news/status/${status}`);
  return response.data;
};
