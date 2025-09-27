const newsService = require('../../services/news.service');
const News = require('../../models/news.model');
const User = require('../../models/user.model');
const NotFoundException = require('../../middlewares/exceptions/notfound');

// Mock dependencies
jest.mock('../../models/news.model');
jest.mock('../../models/user.model');

describe('News Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create news successfully', async () => {
      const newsData = {
        title: 'Test News',
        content: 'Test content',
        authorId: '507f1f77bcf86cd799439011',
        status: 'draft'
      };
      
      const mockNews = { _id: '1', ...newsData };
      const mockSave = jest.fn().mockResolvedValue(mockNews);
      News.mockImplementation(() => ({ save: mockSave }));

      const result = await newsService.create(newsData);

      expect(News).toHaveBeenCalledWith(newsData);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockNews);
    });

    it('should handle creation errors', async () => {
      const newsData = {
        title: 'Test News',
        content: 'Test content',
        authorId: '507f1f77bcf86cd799439011'
      };
      
      const error = new Error('Validation error');
      const mockSave = jest.fn().mockRejectedValue(error);
      News.mockImplementation(() => ({ save: mockSave }));

      await expect(newsService.create(newsData)).rejects.toThrow('Validation error');
    });
  });

  describe('findAll', () => {
    it('should find all news with default pagination', async () => {
      const mockNews = [{ _id: '1', title: 'Test News' }];
      const mockFind = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockNews)
            })
          })
        })
      });
      const mockCountDocuments = jest.fn().mockResolvedValue(1);
      
      News.find = mockFind;
      News.countDocuments = mockCountDocuments;

      const result = await newsService.findAll();

      expect(mockFind).toHaveBeenCalledWith({});
      expect(mockCountDocuments).toHaveBeenCalledWith({});
      expect(result).toEqual({
        data: mockNews,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1
        }
      });
    });

    it('should find news with filters', async () => {
      const mockNews = [{ _id: '1', title: 'Test News', status: 'published' }];
      const mockFind = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockNews)
            })
          })
        })
      });
      const mockCountDocuments = jest.fn().mockResolvedValue(1);
      
      News.find = mockFind;
      News.countDocuments = mockCountDocuments;

      const filters = {
        page: 2,
        limit: 5,
        status: 'published',
        search: 'test',
        authorId: '507f1f77bcf86cd799439011'
      };

      const result = await newsService.findAll(filters);

      expect(mockFind).toHaveBeenCalledWith({
        status: 'published',
        authorId: '507f1f77bcf86cd799439011',
        $or: [
          { title: { $regex: 'test', $options: 'i' } },
          { content: { $regex: 'test', $options: 'i' } }
        ]
      });
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });
  });

  describe('findById', () => {
    it('should find news by ID', async () => {
      const mockNews = { _id: '1', title: 'Test News' };
      const mockFindById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockNews)
      });
      
      News.findById = mockFindById;

      const result = await newsService.findById('1');

      expect(mockFindById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockNews);
    });

    it('should throw NotFoundException when news not found', async () => {
      const mockFindById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });
      
      News.findById = mockFindById;

      await expect(newsService.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update news successfully', async () => {
      const mockNews = { _id: '1', title: 'Updated News' };
      const mockFindByIdAndUpdate = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockNews)
      });
      
      News.findByIdAndUpdate = mockFindByIdAndUpdate;

      const updateData = { title: 'Updated News', content: 'Updated content' };
      const result = await newsService.update('1', updateData);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { ...updateData, updatedAt: expect.any(Number) },
        { new: true, runValidators: true }
      );
      expect(result).toEqual(mockNews);
    });

    it('should throw NotFoundException when news not found', async () => {
      const mockFindByIdAndUpdate = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });
      
      News.findByIdAndUpdate = mockFindByIdAndUpdate;

      await expect(newsService.update('nonexistent', { title: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete news successfully', async () => {
      const mockNews = { _id: '1', title: 'Test News' };
      const mockFindByIdAndDelete = jest.fn().mockResolvedValue(mockNews);
      
      News.findByIdAndDelete = mockFindByIdAndDelete;

      const result = await newsService.remove('1');

      expect(mockFindByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockNews);
    });

    it('should throw NotFoundException when news not found', async () => {
      const mockFindByIdAndDelete = jest.fn().mockResolvedValue(null);
      
      News.findByIdAndDelete = mockFindByIdAndDelete;

      await expect(newsService.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByStatus', () => {
    it('should find news by status', async () => {
      const mockNews = [{ _id: '1', title: 'Published News', status: 'published' }];
      const mockFind = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockNews)
        })
      });
      
      News.find = mockFind;

      const result = await newsService.findByStatus('published');

      expect(mockFind).toHaveBeenCalledWith({ status: 'published' });
      expect(result).toEqual(mockNews);
    });
  });

  describe('getPublishedNews', () => {
    it('should get published news with default limit', async () => {
      const mockNews = [{ _id: '1', title: 'Published News', status: 'published' }];
      const mockFind = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockNews)
          })
        })
      });
      
      News.find = mockFind;

      const result = await newsService.getPublishedNews();

      expect(mockFind).toHaveBeenCalledWith({ status: 'published' });
      expect(result).toEqual(mockNews);
    });

    it('should get published news with custom limit', async () => {
      const mockNews = [{ _id: '1', title: 'Published News', status: 'published' }];
      const mockFind = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockNews)
          })
        })
      });
      
      News.find = mockFind;

      const result = await newsService.getPublishedNews(5);

      expect(mockFind).toHaveBeenCalledWith({ status: 'published' });
      expect(result).toEqual(mockNews);
    });
  });

  describe('getNewsByAuthor', () => {
    it('should get news by author with default pagination', async () => {
      const mockNews = [{ _id: '1', title: 'Author News', authorId: '507f1f77bcf86cd799439011' }];
      const mockFind = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockNews)
            })
          })
        })
      });
      const mockCountDocuments = jest.fn().mockResolvedValue(1);
      
      News.find = mockFind;
      News.countDocuments = mockCountDocuments;

      const result = await newsService.getNewsByAuthor('507f1f77bcf86cd799439011');

      expect(mockFind).toHaveBeenCalledWith({ authorId: '507f1f77bcf86cd799439011' });
      expect(result).toEqual({
        data: mockNews,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1
        }
      });
    });

    it('should get news by author with filters', async () => {
      const mockNews = [{ _id: '1', title: 'Author News', status: 'draft' }];
      const mockFind = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockNews)
            })
          })
        })
      });
      const mockCountDocuments = jest.fn().mockResolvedValue(1);
      
      News.find = mockFind;
      News.countDocuments = mockCountDocuments;

      const filters = { page: 2, limit: 5, status: 'draft' };
      const result = await newsService.getNewsByAuthor('507f1f77bcf86cd799439011', filters);

      expect(mockFind).toHaveBeenCalledWith({ 
        authorId: '507f1f77bcf86cd799439011',
        status: 'draft'
      });
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });
  });
});
