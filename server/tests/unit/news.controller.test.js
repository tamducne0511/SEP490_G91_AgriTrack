const newsController = require('../../controllers/admin/news.controller');
const newsService = require('../../services/news.service');
const { validationResult } = require('express-validator');

// Mock dependencies
jest.mock('../../services/news.service');
jest.mock('express-validator');

describe('News Controller Unit Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      params: {},
      query: {},
      body: {},
      user: { id: '507f1f77bcf86cd799439011' },
      file: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getAllNews', () => {
    it('should retrieve all news with pagination', async () => {
      const mockResult = {
        data: [{ _id: '1', title: 'Test News', content: 'Test content' }],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 }
      };
      
      newsService.findAll.mockResolvedValue(mockResult);
      mockReq.query = { page: 1, limit: 10 };

      await newsController.getAllNews(mockReq, mockRes, mockNext);

      expect(newsService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: undefined,
        search: undefined,
        authorId: undefined
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'News retrieved successfully',
        data: mockResult.data,
        pagination: mockResult.pagination
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      newsService.findAll.mockRejectedValue(error);

      await newsController.getAllNews(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getNewsById', () => {
    it('should retrieve news by ID', async () => {
      const mockNews = { _id: '1', title: 'Test News', content: 'Test content' };
      newsService.findById.mockResolvedValue(mockNews);
      mockReq.params = { id: '1' };

      await newsController.getNewsById(mockReq, mockRes, mockNext);

      expect(newsService.findById).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'News retrieved successfully',
        data: mockNews
      });
    });

    it('should handle news not found', async () => {
      const error = new Error('News not found');
      newsService.findById.mockRejectedValue(error);
      mockReq.params = { id: 'nonexistent' };

      await newsController.getNewsById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createNews', () => {
    it('should create news successfully', async () => {
      const mockNews = { _id: '1', title: 'Test News', content: 'Test content' };
      const mockValidationResult = { isEmpty: () => true };
      
      validationResult.mockReturnValue(mockValidationResult);
      newsService.create.mockResolvedValue(mockNews);
      
      mockReq.body = {
        title: 'Test News',
        content: 'Test content',
        status: 'draft'
      };

      await newsController.createNews(mockReq, mockRes, mockNext);

      expect(newsService.create).toHaveBeenCalledWith({
        title: 'Test News',
        content: 'Test content',
        status: 'draft',
        authorId: '507f1f77bcf86cd799439011',
        image: null
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'News created successfully',
        data: mockNews
      });
    });

    it('should create news with image', async () => {
      const mockNews = { _id: '1', title: 'Test News', content: 'Test content' };
      const mockValidationResult = { isEmpty: () => true };
      
      validationResult.mockReturnValue(mockValidationResult);
      newsService.create.mockResolvedValue(mockNews);
      
      mockReq.body = { title: 'Test News', content: 'Test content' };
      mockReq.file = { filename: 'test-image.jpg' };

      await newsController.createNews(mockReq, mockRes, mockNext);

      expect(newsService.create).toHaveBeenCalledWith({
        title: 'Test News',
        content: 'Test content',
        status: 'draft',
        authorId: '507f1f77bcf86cd799439011',
        image: '/uploads/news/test-image.jpg'
      });
    });

    it('should return validation errors', async () => {
      const mockValidationResult = { 
        isEmpty: () => false, 
        array: () => [{ msg: 'Title is required' }] 
      };
      
      validationResult.mockReturnValue(mockValidationResult);

      await newsController.createNews(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: [{ msg: 'Title is required' }]
      });
    });

    it('should handle service errors', async () => {
      const mockValidationResult = { isEmpty: () => true };
      const error = new Error('Service error');
      
      validationResult.mockReturnValue(mockValidationResult);
      newsService.create.mockRejectedValue(error);

      await newsController.createNews(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateNews', () => {
    it('should update news successfully', async () => {
      const mockNews = { _id: '1', title: 'Updated News', content: 'Updated content' };
      const mockValidationResult = { isEmpty: () => true };
      const existingNews = { authorId: { _id: '507f1f77bcf86cd799439011' } };
      
      validationResult.mockReturnValue(mockValidationResult);
      newsService.findById.mockResolvedValue(existingNews);
      newsService.update.mockResolvedValue(mockNews);
      
      mockReq.params = { id: '1' };
      mockReq.body = { title: 'Updated News', content: 'Updated content' };

      await newsController.updateNews(mockReq, mockRes, mockNext);

      expect(newsService.update).toHaveBeenCalledWith('1', {
        title: 'Updated News',
        content: 'Updated content',
        status: undefined
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'News updated successfully',
        data: mockNews
      });
    });

    it('should update news with image', async () => {
      const mockNews = { _id: '1', title: 'Updated News', content: 'Updated content' };
      const mockValidationResult = { isEmpty: () => true };
      const existingNews = { authorId: { _id: '507f1f77bcf86cd799439011' } };
      
      validationResult.mockReturnValue(mockValidationResult);
      newsService.findById.mockResolvedValue(existingNews);
      newsService.update.mockResolvedValue(mockNews);
      
      mockReq.params = { id: '1' };
      mockReq.body = { title: 'Updated News', content: 'Updated content' };
      mockReq.file = { filename: 'new-image.jpg' };

      await newsController.updateNews(mockReq, mockRes, mockNext);

      expect(newsService.update).toHaveBeenCalledWith('1', {
        title: 'Updated News',
        content: 'Updated content',
        status: undefined,
        image: '/uploads/news/new-image.jpg'
      });
    });

    it('should remove image when removeImage is true', async () => {
      const mockNews = { _id: '1', title: 'Updated News', content: 'Updated content' };
      const mockValidationResult = { isEmpty: () => true };
      const existingNews = { authorId: { _id: '507f1f77bcf86cd799439011' } };
      
      validationResult.mockReturnValue(mockValidationResult);
      newsService.findById.mockResolvedValue(existingNews);
      newsService.update.mockResolvedValue(mockNews);
      
      mockReq.params = { id: '1' };
      mockReq.body = { title: 'Updated News', content: 'Updated content', removeImage: 'true' };

      await newsController.updateNews(mockReq, mockRes, mockNext);

      expect(newsService.update).toHaveBeenCalledWith('1', {
        title: 'Updated News',
        content: 'Updated content',
        status: undefined,
        image: null
      });
    });

    it('should return 403 if user is not the author', async () => {
      const existingNews = { authorId: { _id: 'different-user-id' } };
      const mockValidationResult = { isEmpty: () => true };
      
      validationResult.mockReturnValue(mockValidationResult);
      newsService.findById.mockResolvedValue(existingNews);
      
      mockReq.params = { id: '1' };
      mockReq.body = { title: 'Updated News', content: 'Updated content' };

      await newsController.updateNews(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You can only update your own news'
      });
    });

    it('should return validation errors', async () => {
      const mockValidationResult = { 
        isEmpty: () => false, 
        array: () => [{ msg: 'Title is required' }] 
      };
      
      validationResult.mockReturnValue(mockValidationResult);

      await newsController.updateNews(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: [{ msg: 'Title is required' }]
      });
    });
  });

  describe('deleteNews', () => {
    it('should delete news successfully', async () => {
      const existingNews = { authorId: { _id: '507f1f77bcf86cd799439011' } };
      
      newsService.findById.mockResolvedValue(existingNews);
      newsService.remove.mockResolvedValue();
      
      mockReq.params = { id: '1' };

      await newsController.deleteNews(mockReq, mockRes, mockNext);

      expect(newsService.remove).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'News deleted successfully'
      });
    });

    it('should return 403 if user is not the author', async () => {
      const existingNews = { authorId: { _id: 'different-user-id' } };
      
      newsService.findById.mockResolvedValue(existingNews);
      
      mockReq.params = { id: '1' };

      await newsController.deleteNews(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You can only delete your own news'
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      newsService.findById.mockRejectedValue(error);
      
      mockReq.params = { id: '1' };

      await newsController.deleteNews(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getPublishedNews', () => {
    it('should retrieve published news', async () => {
      const mockNews = [{ _id: '1', title: 'Published News', status: 'published' }];
      newsService.getPublishedNews.mockResolvedValue(mockNews);
      mockReq.query = { limit: 5 };

      await newsController.getPublishedNews(mockReq, mockRes, mockNext);

      expect(newsService.getPublishedNews).toHaveBeenCalledWith(5);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Published news retrieved successfully',
        data: mockNews
      });
    });

    it('should use default limit when not provided', async () => {
      const mockNews = [{ _id: '1', title: 'Published News', status: 'published' }];
      newsService.getPublishedNews.mockResolvedValue(mockNews);

      await newsController.getPublishedNews(mockReq, mockRes, mockNext);

      expect(newsService.getPublishedNews).toHaveBeenCalledWith(10);
    });
  });

  describe('getNewsByStatus', () => {
    it('should retrieve news by status', async () => {
      const mockNews = [{ _id: '1', title: 'Draft News', status: 'draft' }];
      newsService.findByStatus.mockResolvedValue(mockNews);
      mockReq.params = { status: 'draft' };

      await newsController.getNewsByStatus(mockReq, mockRes, mockNext);

      expect(newsService.findByStatus).toHaveBeenCalledWith('draft');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'draft news retrieved successfully',
        data: mockNews
      });
    });
  });

  describe('getMyNews', () => {
    it('should retrieve current expert\'s news', async () => {
      const mockResult = {
        data: [{ _id: '1', title: 'My News', authorId: '507f1f77bcf86cd799439011' }],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 }
      };
      
      newsService.getNewsByAuthor.mockResolvedValue(mockResult);
      mockReq.query = { page: 1, limit: 10, status: 'draft' };

      await newsController.getMyNews(mockReq, mockRes, mockNext);

      expect(newsService.getNewsByAuthor).toHaveBeenCalledWith('507f1f77bcf86cd799439011', {
        page: 1,
        limit: 10,
        status: 'draft'
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Your news retrieved successfully',
        data: mockResult.data,
        pagination: mockResult.pagination
      });
    });
  });
});
