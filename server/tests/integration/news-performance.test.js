const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../simple-test-app');
const News = require('../../models/news.model');
const User = require('../../models/user.model');
const jwt = require('jsonwebtoken');

describe('News API Performance Tests', () => {
  let authToken;
  let expertToken;
  let testUser;
  let testExpert;

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
    // Create multiple test news articles for performance testing
    const newsArticles = [];
    for (let i = 0; i < 50; i++) {
      newsArticles.push({
        title: `Test News Article ${i}`,
        content: `This is test news article content number ${i}. It contains more detailed information about various topics.`,
        authorId: testExpert._id,
        status: i % 3 === 0 ? 'published' : i % 3 === 1 ? 'draft' : 'archived',
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000) // Spread over time
      });
    }
    await News.insertMany(newsArticles);
  });

  afterEach(async () => {
    await News.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('Pagination Performance', () => {
    it('should handle large page numbers efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/admin/news?page=10&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination.page).toBe(10);
      expect(response.body.pagination.limit).toBe(5);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle large limit values efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/admin/news?limit=100')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination.limit).toBe(100);
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle pagination with filters efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/admin/news?status=published&search=test&page=5&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.data).toBeInstanceOf(Array);
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('Search Performance', () => {
    it('should handle complex search queries efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/admin/news?search=article content detailed information')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.data).toBeInstanceOf(Array);
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle search with special characters efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/admin/news?search=test%20news%20article')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.data).toBeInstanceOf(Array);
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle empty search results efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/admin/news?search=nonexistentcontent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.data).toEqual([]);
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('Concurrent Request Performance', () => {
    it('should handle multiple concurrent GET requests', async () => {
      const startTime = Date.now();
      
      const promises = Array(10).fill().map(() => 
        request(app)
          .get('/admin/news')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      expect(totalTime).toBeLessThan(2000); // All requests should complete within 2 seconds
    });

    it('should handle concurrent requests with different filters', async () => {
      const startTime = Date.now();
      
      const promises = [
        request(app).get('/admin/news?status=published').set('Authorization', `Bearer ${authToken}`),
        request(app).get('/admin/news?status=draft').set('Authorization', `Bearer ${authToken}`),
        request(app).get('/admin/news?status=archived').set('Authorization', `Bearer ${authToken}`),
        request(app).get('/admin/news?search=test').set('Authorization', `Bearer ${authToken}`),
        request(app).get('/admin/news?page=2&limit=5').set('Authorization', `Bearer ${authToken}`)
      ];

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      expect(totalTime).toBeLessThan(2000);
    });
  });

  describe('Data Volume Performance', () => {
    it('should handle requests with large response data', async () => {
      // Create more news articles for this test
      const additionalNews = [];
      for (let i = 50; i < 100; i++) {
        additionalNews.push({
          title: `Additional Test News Article ${i}`,
          content: `This is additional test news article content number ${i}. It contains more detailed information about various topics and provides comprehensive coverage of the subject matter.`,
          authorId: testExpert._id,
          status: 'published'
        });
      }
      await News.insertMany(additionalNews);

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/admin/news?limit=50')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('Memory Usage Performance', () => {
    it('should not cause memory leaks with repeated requests', async () => {
      const initialMemory = process.memoryUsage();
      
      // Make multiple requests
      for (let i = 0; i < 20; i++) {
        await request(app)
          .get('/admin/news')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Response Time Performance', () => {
    it('should respond to simple queries within acceptable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/admin/news/published')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(500); // Should respond within 500ms
    });

    it('should respond to complex queries within acceptable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/admin/news?status=published&search=test&page=1&limit=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should respond to expert-specific queries within acceptable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/admin/news/my/news')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(500);
    });
  });

  describe('Database Query Performance', () => {
    it('should efficiently query by status', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/admin/news/status/published')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.data).toBeInstanceOf(Array);
      expect(responseTime).toBeLessThan(500);
    });

    it('should efficiently query by author', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/admin/news/my/news')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.data).toBeInstanceOf(Array);
      expect(responseTime).toBeLessThan(500);
    });
  });

  describe('Edge Case Performance', () => {
    it('should handle extreme pagination values efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/admin/news?page=1000&limit=1000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.data).toBeInstanceOf(Array);
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle very long search strings efficiently', async () => {
      const longSearchString = 'test'.repeat(100);
      const startTime = Date.now();
      
      const response = await request(app)
        .get(`/admin/news?search=${encodeURIComponent(longSearchString)}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.data).toBeInstanceOf(Array);
      expect(responseTime).toBeLessThan(1000);
    });
  });
});
