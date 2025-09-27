const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./simple-test-app');
const News = require('../models/news.model');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

describe('Debug Test', () => {
  let expertToken;
  let testExpert;
  let testNews;

  beforeAll(async () => {
    // Create test expert
    testExpert = await User.create({
      fullName: 'Test Expert',
      email: 'expert@test.com',
      password: 'password123',
      role: 'expert'
    });

    // Generate JWT token
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

  it('should debug update news', async () => {
    const updateData = {
      title: 'Updated Test News',
      content: 'This is updated content',
      status: 'published'
    };

    console.log('Test News ID:', testNews._id);
    console.log('Expert Token:', expertToken);
    console.log('Update Data:', updateData);

    const response = await request(app)
      .put(`/admin/news/${testNews._id}`)
      .set('Authorization', `Bearer ${expertToken}`)
      .send(updateData);

    console.log('Response Status:', response.status);
    console.log('Response Body:', response.body);

    expect(response.status).toBe(200);
  });
});
