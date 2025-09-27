const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../simple-test-app');
const News = require('../../models/news.model');
const User = require('../../models/user.model');
const jwt = require('jsonwebtoken');

describe('News API Integration Tests', () => {
  let authToken;
  let expertToken;
  let adminToken;
  let testUser;
  let testExpert;
  let testAdmin;
  let testNews;

  beforeAll(async () => {
    // Create test users
    testUser = await User.create({
      fullName: 'Test User',
      email: 'user@test.com',
      password: 'password123',
      role: 'farmer'
    });

    testExpert = await User.create({
      fullName: 'Test Expert',
      email: 'expert@test.com',
      password: 'password123',
      role: 'expert'
    });

    testAdmin = await User.create({
      fullName: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });

    // Generate JWT tokens
    authToken = jwt.sign({ id: testUser._id, role: 'farmer' }, process.env.JWT_SECRET);
    expertToken = jwt.sign({ id: testExpert._id, role: 'expert' }, process.env.JWT_SECRET);
    adminToken = jwt.sign({ id: testAdmin._id, role: 'admin' }, process.env.JWT_SECRET);
  });

  beforeEach(async () => {
    // Create test news
    testNews = await News.create({
      title: 'Test News Article',
      content: 'This is a test news article content',
      authorId: testExpert._id,
      status: 'published'
    });
  });

  afterEach(async () => {
    // Clean up news
    await News.deleteMany({});
  });

  afterAll(async () => {
    // Clean up users
    await User.deleteMany({});
  });

  describe('GET /admin/news', () => {
    it('should get all news with pagination', async () => {
      const response = await request(app)
        .get('/admin/news')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('News retrieved successfully');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should get news with filters', async () => {
      const response = await request(app)
        .get('/admin/news?status=published&page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should search news by title and content', async () => {
      const response = await request(app)
        .get('/admin/news?search=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/admin/news')
        .expect(401);
    });
  });

  describe('GET /admin/news/published', () => {
    it('should get published news', async () => {
      const response = await request(app)
        .get('/admin/news/published')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Published news retrieved successfully');
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should get published news with custom limit', async () => {
      const response = await request(app)
        .get('/admin/news/published?limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /admin/news/status/:status', () => {
    it('should get news by status', async () => {
      const response = await request(app)
        .get('/admin/news/status/published')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('published news retrieved successfully');
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should return empty array for non-existent status', async () => {
      const response = await request(app)
        .get('/admin/news/status/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /admin/news/my/news', () => {
    it('should get expert\'s own news', async () => {
      const response = await request(app)
        .get('/admin/news/my/news')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      expect(response.body.message).toBe('Your news retrieved successfully');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should return 401 for non-expert users', async () => {
      await request(app)
        .get('/admin/news/my/news')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);
    });

    it('should filter expert\'s news by status', async () => {
      const response = await request(app)
        .get('/admin/news/my/news?status=published')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /admin/news/:id', () => {
    it('should get news by ID', async () => {
      const response = await request(app)
        .get(`/admin/news/${testNews._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('News retrieved successfully');
      expect(response.body.data._id).toBe(testNews._id.toString());
      expect(response.body.data.title).toBe('Test News Article');
    });

    it('should return 404 for non-existent news', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/admin/news/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(app)
        .get('/admin/news/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('POST /admin/news', () => {
    it('should create news as expert', async () => {
      const newsData = {
        title: 'New Test News',
        content: 'This is a new test news article content',
        status: 'draft'
      };

      const response = await request(app)
        .post('/admin/news')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(newsData)
        .expect(201);

      expect(response.body.message).toBe('News created successfully');
      expect(response.body.data.title).toBe(newsData.title);
      expect(response.body.data.content).toBe(newsData.content);
      expect(response.body.data.status).toBe(newsData.status);
      expect(response.body.data.authorId).toBe(testExpert._id.toString());
    });

    it('should create news with default status', async () => {
      const newsData = {
        title: 'New Test News',
        content: 'This is a new test news article content'
      };

      const response = await request(app)
        .post('/admin/news')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(newsData)
        .expect(201);

      expect(response.body.data.status).toBe('draft');
    });

    it('should return 400 for validation errors', async () => {
      const invalidData = {
        title: 'Sh', // Too short
        content: 'Short' // Too short
      };

      const response = await request(app)
        .post('/admin/news')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 401 for non-expert users', async () => {
      const newsData = {
        title: 'New Test News',
        content: 'This is a new test news article content'
      };

      await request(app)
        .post('/admin/news')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newsData)
        .expect(401);
    });

    it('should return 401 without authentication', async () => {
      const newsData = {
        title: 'New Test News',
        content: 'This is a new test news article content'
      };

      await request(app)
        .post('/admin/news')
        .send(newsData)
        .expect(401);
    });
  });

  describe('PUT /admin/news/:id', () => {
    it('should update own news as expert', async () => {
      const updateData = {
        title: 'Updated Test News',
        content: 'This is updated content',
        status: 'published'
      };

      const response = await request(app)
        .put(`/admin/news/${testNews._id}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('News updated successfully');
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.content).toBe(updateData.content);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('should return 403 when trying to update other expert\'s news', async () => {
      // Create another expert
      const anotherExpert = await User.create({
        fullName: 'Another Expert',
        email: 'anotherexpert@test.com',
        password: 'password123',
        role: 'expert'
      });

      const anotherExpertToken = jwt.sign({ id: anotherExpert._id, role: 'expert' }, process.env.JWT_SECRET);

      const updateData = {
        title: 'Updated Test News',
        content: 'This is updated content'
      };

      await request(app)
        .put(`/admin/news/${testNews._id}`)
        .set('Authorization', `Bearer ${anotherExpertToken}`)
        .send(updateData)
        .expect(403);

      // Clean up
      await User.findByIdAndDelete(anotherExpert._id);
    });

    it('should return 400 for validation errors', async () => {
      const invalidData = {
        title: 'Sh', // Too short
        content: 'Short' // Too short
      };

      const response = await request(app)
        .put(`/admin/news/${testNews._id}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should return 404 for non-existent news', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        title: 'Updated Test News',
        content: 'This is updated content'
      };

      await request(app)
        .put(`/admin/news/${fakeId}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should return 401 for non-expert users', async () => {
      const updateData = {
        title: 'Updated Test News',
        content: 'This is updated content'
      };

      await request(app)
        .put(`/admin/news/${testNews._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('DELETE /admin/news/:id', () => {
    it('should delete own news as expert', async () => {
      const response = await request(app)
        .delete(`/admin/news/${testNews._id}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      expect(response.body.message).toBe('News deleted successfully');

      // Verify news is deleted
      const deletedNews = await News.findById(testNews._id);
      expect(deletedNews).toBeNull();
    });

    it('should return 403 when trying to delete other expert\'s news', async () => {
      // Create another expert
      const anotherExpert = await User.create({
        fullName: 'Another Expert',
        email: 'anotherexpert@test.com',
        password: 'password123',
        role: 'expert'
      });

      const anotherExpertToken = jwt.sign({ id: anotherExpert._id, role: 'expert' }, process.env.JWT_SECRET);

      await request(app)
        .delete(`/admin/news/${testNews._id}`)
        .set('Authorization', `Bearer ${anotherExpertToken}`)
        .expect(403);

      // Clean up
      await User.findByIdAndDelete(anotherExpert._id);
    });

    it('should return 404 for non-existent news', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .delete(`/admin/news/${fakeId}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(404);
    });

    it('should return 401 for non-expert users', async () => {
      await request(app)
        .delete(`/admin/news/${testNews._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      await request(app)
        .post('/admin/news')
        .set('Authorization', `Bearer ${expertToken}`)
        .set('Content-Type', 'application/json')
        .send('{"title": "Test", "content": "Test content"') // Missing closing brace
        .expect(400);
    });

    it('should handle invalid JWT token', async () => {
      await request(app)
        .get('/admin/news')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should handle missing Authorization header', async () => {
      await request(app)
        .get('/admin/news')
        .expect(401);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title and content', async () => {
      const longTitle = 'A'.repeat(200); // Max allowed length
      const longContent = 'B'.repeat(1000);

      const newsData = {
        title: longTitle,
        content: longContent
      };

      const response = await request(app)
        .post('/admin/news')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(newsData)
        .expect(201);

      expect(response.body.data.title).toBe(longTitle);
      expect(response.body.data.content).toBe(longContent);
    });

    it('should handle special characters in search', async () => {
      const response = await request(app)
        .get('/admin/news?search=test&special=chars!@#$%^&*()')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should handle large pagination values', async () => {
      const response = await request(app)
        .get('/admin/news?page=1&limit=1000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.limit).toBe(1000);
    });

    it('should handle negative pagination values', async () => {
      const response = await request(app)
        .get('/admin/news?page=-1&limit=-10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should handle negative values gracefully
      expect(response.body.pagination).toBeDefined();
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });
});
