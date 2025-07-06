const request = require('supertest');
const app = require('../../app');
const { createTestUser, generateToken, getAuthHeaders } = require('../utils/testUtils');
const User = require('../../models/user.model');

describe('Auth Controller', () => {
  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Create a test user
      const testUser = await createTestUser({
        email: 'test@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should fail login with invalid email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail login with invalid password', async () => {
      // Create a test user
      await createTestUser({
        email: 'test@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail login with missing email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should fail login with missing password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });
  });

  describe('GET /auth/me', () => {
    it('should get current user profile with valid token', async () => {
      // Create a test user
      const testUser = await createTestUser();
      const token = generateToken(testUser);

      const response = await request(app)
        .get('/auth/me')
        .set(getAuthHeaders(token));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User retrieved successfully');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('farm');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set(getAuthHeaders('invalid-token'));

      expect(response.status).toBe(401);
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/auth/me');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /auth/profile', () => {
    it('should update profile successfully with valid data', async () => {
      // Create a test user
      const testUser = await createTestUser();
      const token = generateToken(testUser);

      const updateData = {
        fullName: 'Updated Name',
        phone: '9876543210',
        address: 'Updated Address',
        gender: 'female',
        birthday: '1995-05-15'
      };

      const response = await request(app)
        .put('/auth/profile')
        .set(getAuthHeaders(token))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.data.fullName).toBe(updateData.fullName);
      expect(response.body.data.phone).toBe(updateData.phone);
      expect(response.body.data.address).toBe(updateData.address);
      expect(response.body.data.gender).toBe(updateData.gender);
      expect(response.body.data.birthday).toBe(updateData.birthday);
    });

    it('should fail with invalid validation data', async () => {
      // Create a test user
      const testUser = await createTestUser();
      const token = generateToken(testUser);

      const invalidData = {
        fullName: '', // Empty name should fail validation
        phone: 'invalid-phone',
        gender: 'invalid-gender'
      };

      const response = await request(app)
        .put('/auth/profile')
        .set(getAuthHeaders(token))
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put('/auth/profile')
        .send({
          fullName: 'Updated Name'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /auth/change-password', () => {
    it('should change password successfully with valid current password', async () => {
      // Create a test user
      const testUser = await createTestUser({
        password: 'oldpassword123'
      });
      const token = generateToken(testUser);

      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/auth/change-password')
        .set(getAuthHeaders(token))
        .send(passwordData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password changed successfully');
    });

    it('should fail with incorrect current password', async () => {
      // Create a test user
      const testUser = await createTestUser({
        password: 'oldpassword123'
      });
      const token = generateToken(testUser);

      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/auth/change-password')
        .set(getAuthHeaders(token))
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Current password is incorrect');
    });

    it('should fail with invalid validation data', async () => {
      // Create a test user
      const testUser = await createTestUser();
      const token = generateToken(testUser);

      const invalidData = {
        currentPassword: '', // Empty password should fail validation
        newPassword: '123' // Too short password
      };

      const response = await request(app)
        .put('/auth/change-password')
        .set(getAuthHeaders(token))
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put('/auth/change-password')
        .send({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword'
        });

      expect(response.status).toBe(401);
    });
  });
}); 