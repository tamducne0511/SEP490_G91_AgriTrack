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

// Mock data for demonstration
const mockNewsData = [
  {
    _id: "1",
    title: "Kỹ thuật chăm sóc nho mùa mưa",
    content: `
      <h2>Hướng dẫn chăm sóc nho trong mùa mưa</h2>
      <p>Mùa mưa là thời điểm quan trọng trong quá trình phát triển của cây nho. Dưới đây là những lưu ý quan trọng:</p>
      <ul>
        <li><strong>Kiểm soát độ ẩm:</strong> Đảm bảo hệ thống thoát nước hoạt động tốt</li>
        <li><strong>Phòng ngừa bệnh:</strong> Sử dụng thuốc phòng ngừa nấm bệnh</li>
        <li><strong>Bón phân:</strong> Điều chỉnh lượng phân bón phù hợp</li>
      </ul>
      <p>Việc chăm sóc đúng cách sẽ giúp cây nho phát triển khỏe mạnh và cho năng suất cao.</p>
    `,
    image: "/uploads/news/nho-mua-mua.jpg",
    status: "published",
    authorId: {
      _id: "expert1",
      fullName: "Nguyễn Văn Chuyên",
      email: "chuyen.nguyen@agritrack.com"
    },
    createdAt: "2024-01-15T08:30:00.000Z",
    updatedAt: "2024-01-15T08:30:00.000Z"
  },
  {
    _id: "2", 
    title: "Quy trình thu hoạch nho đúng cách",
    content: `
      <h2>Bí quyết thu hoạch nho đạt chất lượng cao</h2>
      <p>Thu hoạch nho đúng thời điểm và đúng cách là yếu tố quyết định đến chất lượng sản phẩm cuối cùng.</p>
      <h3>Thời điểm thu hoạch tối ưu:</h3>
      <ul>
        <li>Độ chín của quả đạt 85-90%</li>
        <li>Màu sắc quả đồng đều</li>
        <li>Độ ngọt đạt tiêu chuẩn</li>
      </ul>
      <h3>Phương pháp thu hoạch:</h3>
      <p>Nên thu hoạch vào sáng sớm khi nhiệt độ thấp để giữ được độ tươi ngon của quả.</p>
    `,
    image: "/uploads/news/thu-hoach-nho.jpg",
    status: "published",
    authorId: {
      _id: "expert2",
      fullName: "Trần Thị Hương",
      email: "huong.tran@agritrack.com"
    },
    createdAt: "2024-01-14T10:15:00.000Z",
    updatedAt: "2024-01-14T10:15:00.000Z"
  },
  {
    _id: "3",
    title: "Phòng trừ sâu bệnh hại nho",
    content: `
      <h2>Hướng dẫn phòng trừ sâu bệnh hại nho</h2>
      <p>Cây nho thường bị tấn công bởi nhiều loại sâu bệnh khác nhau. Việc phòng trừ kịp thời là rất quan trọng.</p>
      <h3>Các loại sâu bệnh phổ biến:</h3>
      <ul>
        <li><strong>Bệnh phấn trắng:</strong> Xuất hiện vào mùa mưa</li>
        <li><strong>Sâu đục thân:</strong> Gây hại nghiêm trọng</li>
        <li><strong>Bệnh thối quả:</strong> Ảnh hưởng đến chất lượng</li>
      </ul>
      <h3>Biện pháp phòng trừ:</h3>
      <p>Sử dụng thuốc bảo vệ thực vật an toàn và tuân thủ đúng liều lượng khuyến cáo.</p>
    `,
    image: "/uploads/news/sau-benh-nho.jpg",
    status: "published",
    authorId: {
      _id: "expert1",
      fullName: "Nguyễn Văn Chuyên",
      email: "chuyen.nguyen@agritrack.com"
    },
    createdAt: "2024-01-13T14:20:00.000Z",
    updatedAt: "2024-01-13T14:20:00.000Z"
  },
  {
    _id: "4",
    title: "Kỹ thuật cắt tỉa cành nho",
    content: `
      <h2>Hướng dẫn cắt tỉa cành nho đúng cách</h2>
      <p>Cắt tỉa cành là một trong những kỹ thuật quan trọng giúp cây nho phát triển tốt và cho năng suất cao.</p>
      <h3>Thời điểm cắt tỉa:</h3>
      <ul>
        <li>Sau khi thu hoạch</li>
        <li>Trước mùa sinh trưởng mới</li>
        <li>Khi cây trong trạng thái nghỉ</li>
      </ul>
      <h3>Nguyên tắc cắt tỉa:</h3>
      <p>Loại bỏ cành già, cành bệnh và giữ lại những cành khỏe mạnh để tạo tán cây cân đối.</p>
    `,
    image: "/uploads/news/cat-tia-nho.jpg",
    status: "draft",
    authorId: {
      _id: "expert2",
      fullName: "Trần Thị Hương", 
      email: "huong.tran@agritrack.com"
    },
    createdAt: "2024-01-12T09:45:00.000Z",
    updatedAt: "2024-01-12T09:45:00.000Z"
  },
  {
    _id: "5",
    title: "Quản lý dinh dưỡng cho cây nho",
    content: `
      <h2>Hướng dẫn quản lý dinh dưỡng cho cây nho</h2>
      <p>Việc cung cấp đầy đủ và cân đối các chất dinh dưỡng là yếu tố quyết định đến sự phát triển của cây nho.</p>
      <h3>Các nguyên tố dinh dưỡng chính:</h3>
      <ul>
        <li><strong>Đạm (N):</strong> Thúc đẩy sinh trưởng</li>
        <li><strong>Lân (P):</strong> Phát triển rễ và hoa</li>
        <li><strong>Kali (K):</strong> Tăng chất lượng quả</li>
      </ul>
      <h3>Lịch bón phân:</h3>
      <p>Bón phân theo từng giai đoạn phát triển của cây để đạt hiệu quả tối ưu.</p>
    `,
    image: "/uploads/news/dinh-duong-nho.jpg",
    status: "published",
    authorId: {
      _id: "expert1",
      fullName: "Nguyễn Văn Chuyên",
      email: "chuyen.nguyen@agritrack.com"
    },
    createdAt: "2024-01-11T16:30:00.000Z",
    updatedAt: "2024-01-11T16:30:00.000Z"
  },
  {
    _id: "6",
    title: "Hệ thống tưới tiêu cho vườn nho",
    content: `
      <h2>Thiết kế hệ thống tưới tiêu hiệu quả cho vườn nho</h2>
      <p>Hệ thống tưới tiêu phù hợp sẽ giúp cây nho phát triển tốt và tiết kiệm nước.</p>
      <h3>Các phương pháp tưới:</h3>
      <ul>
        <li><strong>Tưới nhỏ giọt:</strong> Tiết kiệm nước, hiệu quả cao</li>
        <li><strong>Tưới phun mưa:</strong> Phù hợp cho vườn lớn</li>
        <li><strong>Tưới rãnh:</strong> Truyền thống, đơn giản</li>
      </ul>
      <h3>Lưu ý quan trọng:</h3>
      <p>Điều chỉnh lượng nước tưới theo từng giai đoạn phát triển của cây.</p>
    `,
    image: "/uploads/news/tuoi-tieu-nho.jpg",
    status: "archived",
    authorId: {
      _id: "expert2",
      fullName: "Trần Thị Hương",
      email: "huong.tran@agritrack.com"
    },
    createdAt: "2024-01-10T11:15:00.000Z",
    updatedAt: "2024-01-10T11:15:00.000Z"
  }
];

export const useNewsStore = create((set, get) => ({
  news: [],
  currentNews: null,
  myNews: [],
  publishedNews: [],
  loading: false,
  error: null,
  useMockData: true, // Toggle for mock data
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },

  // Get all news with filters (using mock data for demonstration)
  fetchNews: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredNews = [...mockNewsData];
      
      // Apply filters
      if (filters.status) {
        filteredNews = filteredNews.filter(news => news.status === filters.status);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredNews = filteredNews.filter(news => 
          news.title.toLowerCase().includes(searchTerm) ||
          news.content.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.authorId) {
        filteredNews = filteredNews.filter(news => news.authorId._id === filters.authorId);
      }
      
      // Apply pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedNews = filteredNews.slice(startIndex, endIndex);
      
      const pagination = {
        page,
        limit,
        total: filteredNews.length,
        pages: Math.ceil(filteredNews.length / limit)
      };
      
      set({ 
        news: paginatedNews, 
        pagination,
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err?.message || "Failed to fetch news", 
        loading: false 
      });
    }
  },

  // Get news by ID (using mock data for demonstration)
  fetchNewsById: async (id) => {
    set({ loading: true, error: null });
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const news = mockNewsData.find(item => item._id === id);
      if (!news) {
        throw new Error("News not found");
      }
      
      set({ 
        currentNews: news, 
        loading: false 
      });
      return news;
    } catch (err) {
      set({ 
        error: err?.message || "Failed to fetch news details", 
        loading: false 
      });
      throw err;
    }
  },

  // Create new news (using mock data for demonstration)
  createNews: async (newsData) => {
    set({ loading: true, error: null });
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newNews = {
        _id: Date.now().toString(),
        title: newsData.title,
        content: newsData.content,
        image: newsData.image ? `/uploads/news/${newsData.image.name}` : null,
        status: newsData.status || "draft",
        authorId: {
          _id: "current-user",
          fullName: "Nguyễn Văn Chuyên",
          email: "chuyen.nguyen@agritrack.com"
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to mock data
      mockNewsData.unshift(newNews);
      
      // Add to news list
      const { news } = get();
      set({ 
        news: [newNews, ...news],
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
      const updatedNews = response.data.data;
      
      // Update in news list
      const { news } = get();
      const updatedNewsList = news.map(item => 
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
      const filteredNews = news.filter(item => item._id !== id);
      
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
      const { data, pagination } = response.data;
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
        publishedNews: response.data.data, 
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
