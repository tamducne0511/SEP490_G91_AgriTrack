const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user.model');
const Farm = require('../../models/farm.model');
const { createTestUser, generateToken, getAuthHeaders } = require('../utils/testUtils');

describe('Auth Integration Tests', () => {
  let testUser;
  let testFarm;

  beforeEach(async () => {
    // Create test farm
    testFarm = new Farm({
      name: 'Test Farm',
      description: 'Test farm for integration tests',
      address: 'Test Address',
      area: 100
    });
    await testFarm.save();

    // Create test user
    testUser = await createTestUser({
      email: 'integration@test.com',
      farmId: testFarm._id
    });
  });

  describe('Complete Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      // Step 1: Login
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.data).toHaveProperty('token');
      expect(loginResponse.body.data).toHaveProperty('user');
      
      const token = loginResponse.body.data.token;
      const user = loginResponse.body.data.user;

      // Step 2: Get current user profile
      const profileResponse = await request(app)
        .get('/auth/me')
        .set(getAuthHeaders(token));

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.data.user.email).toBe('integration@test.com');
      expect(profileResponse.body.data.farm._id).toBe(testFarm._id.toString());

      // Step 3: Update profile
      const updateData = {
        fullName: 'Updated Integration User',
        phone: '9876543210',
        address: 'Updated Integration Address',
        gender: 'female',
        birthday: '1995-05-15'
      };

      const updateResponse = await request(app)
        .put('/auth/profile')
        .set(getAuthHeaders(token))
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.fullName).toBe(updateData.fullName);
      expect(updateResponse.body.data.phone).toBe(updateData.phone);

      // Step 4: Change password
      const passwordData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };

      const passwordResponse = await request(app)
        .put('/auth/change-password')
        .set(getAuthHeaders(token))
        .send(passwordData);

      expect(passwordResponse.status).toBe(200);

      // Step 5: Login with new password
      const newLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'newpassword123'
        });

      expect(newLoginResponse.status).toBe(200);
      expect(newLoginResponse.body.data).toHaveProperty('token');
    });

    it('should handle invalid login attempts', async () => {
      // Try to login with wrong password
      const wrongPasswordResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'wrongpassword'
        });

      expect(wrongPasswordResponse.status).toBe(400);

      // Try to login with non-existent email
      const wrongEmailResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        });

      expect(wrongEmailResponse.status).toBe(400);
    });

    it('should handle profile update with invalid data', async () => {
      const token = generateToken(testUser);

      // Try to update with invalid phone number
      const invalidUpdateResponse = await request(app)
        .put('/auth/profile')
        .set(getAuthHeaders(token))
        .send({
          fullName: 'Test User',
          phone: 'invalid-phone',
          gender: 'invalid-gender'
        });

      expect(invalidUpdateResponse.status).toBe(400);
      expect(invalidUpdateResponse.body).toHaveProperty('errors');
    });

    it('should handle password change with wrong current password', async () => {
      const token = generateToken(testUser);

      const passwordResponse = await request(app)
        .put('/auth/change-password')
        .set(getAuthHeaders(token))
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        });

      expect(passwordResponse.status).toBe(400);
      expect(passwordResponse.body.message).toBe('Current password is incorrect');
    });
  });

  describe('Token Validation', () => {
    it('should reject requests with invalid tokens', async () => {
      const invalidToken = 'invalid.token.here';

      const response = await request(app)
        .get('/auth/me')
        .set(getAuthHeaders(invalidToken));

      expect(response.status).toBe(401);
    });

    it('should reject requests without tokens', async () => {
      const response = await request(app)
        .get('/auth/me');

      expect(response.status).toBe(401);
    });

    it('should accept requests with valid tokens', async () => {
      const token = generateToken(testUser);

      const response = await request(app)
        .get('/auth/me')
        .set(getAuthHeaders(token));

      expect(response.status).toBe(200);
    });
  });

  describe('Data Persistence', () => {
    it('should persist user data across requests', async () => {
      const token = generateToken(testUser);

      // Update profile
      const updateData = {
        fullName: 'Persistent User',
        phone: '1234567890'
      };

      await request(app)
        .put('/auth/profile')
        .set(getAuthHeaders(token))
        .send(updateData);

      // Verify the data is persisted
      const profileResponse = await request(app)
        .get('/auth/me')
        .set(getAuthHeaders(token));

      expect(profileResponse.body.data.user.fullName).toBe(updateData.fullName);
      expect(profileResponse.body.data.user.phone).toBe(updateData.phone);
    });
  });
}); 