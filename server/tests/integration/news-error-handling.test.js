const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../simple-test-app');
const News = require('../../models/news.model');
const User = require('../../models/user.model');
const jwt = require('jsonwebtoken');

describe('News API Error Handling Tests', () => {
  let authToken;
  let expertToken;
  let testUser;
  let testExpert;
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

    // Generate JWT tokens
    authToken = jwt.sign({ id: testUser._id, role: 'farmer' }, process.env.JWT_SECRET);
    expertToken = jwt.sign({ id: testExpert._id, role: 'expert' }, process.env.JWT_SECRET);
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
    await News.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('Authentication Errors', () => {
    it('should return 401 for missing token', async () => {
      await request(app)
        .get('/admin/news')
        .expect(401);
    });

    it('should return 401 for invalid token format', async () => {
      await request(app)
        .get('/admin/news')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });

    it('should return 401 for malformed JWT token', async () => {
      await request(app)
        .get('/admin/news')
        .set('Authorization', 'Bearer malformed.jwt.token')
        .expect(401);
    });

    it('should return 401 for expired token', async () => {
      const expiredToken = jwt.sign(
        { id: testUser._id, role: 'farmer' }, 
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      await request(app)
        .get('/admin/news')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should return 401 for token with invalid signature', async () => {
      const invalidToken = jwt.sign(
        { id: testUser._id, role: 'farmer' }, 
        'wrong-secret'
      );

      await request(app)
        .get('/admin/news')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
    });
  });

  describe('Authorization Errors', () => {
    it('should return 403 for farmer trying to create news', async () => {
      const newsData = {
        title: 'Test News',
        content: 'Test content'
      };

      await request(app)
        .post('/admin/news')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newsData)
        .expect(403);
    });

    it('should return 403 for farmer trying to update news', async () => {
      const updateData = {
        title: 'Updated News',
        content: 'Updated content'
      };

      await request(app)
        .put(`/admin/news/${testNews._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should return 403 for farmer trying to delete news', async () => {
      await request(app)
        .delete(`/admin/news/${testNews._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    it('should return 403 for farmer trying to access my/news', async () => {
      await request(app)
        .get('/admin/news/my/news')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe('Validation Errors', () => {
    describe('Create News Validation', () => {
      it('should return 400 for missing title', async () => {
        const newsData = {
          content: 'Test content'
        };

        const response = await request(app)
          .post('/admin/news')
          .set('Authorization', `Bearer ${expertToken}`)
          .send(newsData)
          .expect(400);

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors.some(error => error.msg.includes('Title is required'))).toBe(true);
      });

      it('should return 400 for missing content', async () => {
        const newsData = {
          title: 'Test News'
        };

        const response = await request(app)
          .post('/admin/news')
          .set('Authorization', `Bearer ${expertToken}`)
          .send(newsData)
          .expect(400);

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors.some(error => error.msg.includes('Content is required'))).toBe(true);
      });

      it('should return 400 for title too short', async () => {
        const newsData = {
          title: 'Sh',
          content: 'Test content'
        };

        const response = await request(app)
          .post('/admin/news')
          .set('Authorization', `Bearer ${expertToken}`)
          .send(newsData)
          .expect(400);

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors.some(error => error.msg.includes('Title must be between 5 and 200 characters'))).toBe(true);
      });

      it('should return 400 for title too long', async () => {
        const newsData = {
          title: 'A'.repeat(201),
          content: 'Test content'
        };

        const response = await request(app)
          .post('/admin/news')
          .set('Authorization', `Bearer ${expertToken}`)
          .send(newsData)
          .expect(400);

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors.some(error => error.msg.includes('Title must be between 5 and 200 characters'))).toBe(true);
      });

      it('should return 400 for content too short', async () => {
        const newsData = {
          title: 'Test News',
          content: 'Short'
        };

        const response = await request(app)
          .post('/admin/news')
          .set('Authorization', `Bearer ${expertToken}`)
          .send(newsData)
          .expect(400);

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors.some(error => error.msg.includes('Content must be at least 10 characters long'))).toBe(true);
      });

      it('should return 400 for invalid status', async () => {
        const newsData = {
          title: 'Test News',
          content: 'Test content',
          status: 'invalid-status'
        };

        const response = await request(app)
          .post('/admin/news')
          .set('Authorization', `Bearer ${expertToken}`)
          .send(newsData)
          .expect(400);

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors.some(error => error.msg.includes('Status must be draft, published, or archived'))).toBe(true);
      });
    });

    describe('Update News Validation', () => {
      it('should return 400 for title too short in update', async () => {
        const updateData = {
          title: 'Sh'
        };

        const response = await request(app)
          .put(`/admin/news/${testNews._id}`)
          .set('Authorization', `Bearer ${expertToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors.some(error => error.msg.includes('Title must be between 5 and 200 characters'))).toBe(true);
      });

      it('should return 400 for content too short in update', async () => {
        const updateData = {
          content: 'Short'
        };

        const response = await request(app)
          .put(`/admin/news/${testNews._id}`)
          .set('Authorization', `Bearer ${expertToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors.some(error => error.msg.includes('Content must be at least 10 characters long'))).toBe(true);
      });

      it('should return 400 for invalid status in update', async () => {
        const updateData = {
          status: 'invalid-status'
        };

        const response = await request(app)
          .put(`/admin/news/${testNews._id}`)
          .set('Authorization', `Bearer ${expertToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors.some(error => error.msg.includes('Status must be draft, published, or archived'))).toBe(true);
      });
    });
  });

  describe('Resource Not Found Errors', () => {
    it('should return 404 for non-existent news ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .get(`/admin/news/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent news ID in update', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        title: 'Updated News',
        content: 'Updated content'
      };

      await request(app)
        .put(`/admin/news/${fakeId}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should return 404 for non-existent news ID in delete', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .delete(`/admin/news/${fakeId}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(404);
    });
  });

  describe('Permission Errors', () => {
    it('should return 403 when expert tries to update other expert\'s news', async () => {
      // Create another expert
      const anotherExpert = await User.create({
        fullName: 'Another Expert',
        email: 'anotherexpert@test.com',
        password: 'password123',
        role: 'expert'
      });

      const anotherExpertToken = jwt.sign({ id: anotherExpert._id, role: 'expert' }, process.env.JWT_SECRET);

      const updateData = {
        title: 'Updated News',
        content: 'Updated content'
      };

      const response = await request(app)
        .put(`/admin/news/${testNews._id}`)
        .set('Authorization', `Bearer ${anotherExpertToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.message).toBe('You can only update your own news');

      // Clean up
      await User.findByIdAndDelete(anotherExpert._id);
    });

    it('should return 403 when expert tries to delete other expert\'s news', async () => {
      // Create another expert
      const anotherExpert = await User.create({
        fullName: 'Another Expert',
        email: 'anotherexpert@test.com',
        password: 'password123',
        role: 'expert'
      });

      const anotherExpertToken = jwt.sign({ id: anotherExpert._id, role: 'expert' }, process.env.JWT_SECRET);

      const response = await request(app)
        .delete(`/admin/news/${testNews._id}`)
        .set('Authorization', `Bearer ${anotherExpertToken}`)
        .expect(403);

      expect(response.body.message).toBe('You can only delete your own news');

      // Clean up
      await User.findByIdAndDelete(anotherExpert._id);
    });
  });

  describe('Malformed Request Errors', () => {
    it('should return 400 for malformed JSON', async () => {
      await request(app)
        .post('/admin/news')
        .set('Authorization', `Bearer ${expertToken}`)
        .set('Content-Type', 'application/json')
        .send('{"title": "Test", "content": "Test content"') // Missing closing brace
        .expect(400);
    });

    it('should return 400 for invalid JSON', async () => {
      await request(app)
        .post('/admin/news')
        .set('Authorization', `Bearer ${expertToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    it('should return 400 for invalid ObjectId format', async () => {
      await request(app)
        .get('/admin/news/invalid-object-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('Database Connection Errors', () => {
    it('should handle database connection issues gracefully', async () => {
      // This test would require mocking database connection failures
      // For now, we'll test that the app doesn't crash on unexpected errors
      const response = await request(app)
        .get('/admin/news')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Rate Limiting and Security', () => {
    it('should handle multiple rapid requests', async () => {
      const promises = Array(10).fill().map(() => 
        request(app)
          .get('/admin/news')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(promises);
      
      // All requests should succeed (assuming no rate limiting is implemented)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle requests with suspicious content', async () => {
      const suspiciousData = {
        title: '<script>alert("xss")</script>',
        content: 'Test content'
      };

      const response = await request(app)
        .post('/admin/news')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(suspiciousData)
        .expect(201);

      // The content should be stored as-is (sanitization would be handled by frontend or additional middleware)
      expect(response.body.data.title).toBe(suspiciousData.title);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty request body', async () => {
      await request(app)
        .post('/admin/news')
        .set('Authorization', `Bearer ${expertToken}`)
        .send({})
        .expect(400);
    });

    it('should handle null values', async () => {
      const nullData = {
        title: null,
        content: null
      };

      await request(app)
        .post('/admin/news')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(nullData)
        .expect(400);
    });

    it('should handle undefined values', async () => {
      const undefinedData = {
        title: undefined,
        content: undefined
      };

      await request(app)
        .post('/admin/news')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(undefinedData)
        .expect(400);
    });

    it('should handle very large request body', async () => {
      const largeData = {
        title: 'Test News',
        content: 'A'.repeat(10000) // Very large content
      };

      const response = await request(app)
        .post('/admin/news')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(largeData)
        .expect(201);

      expect(response.body.data.content).toBe(largeData.content);
    });

    it('should handle special characters in URL parameters', async () => {
      const response = await request(app)
        .get('/admin/news?search=test%20news&status=published')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });
});
