const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../models/user.model');
const Farm = require('../../../models/farm.model');

// Import the test app without database connection
const app = require('../test-app');

describe('Auth Integration Tests', () => {
  let testUser, testFarm, authToken;

  beforeEach(async () => {
    // Create test farm
    testFarm = await Farm.create({
      name: 'Test Farm',
      description: 'Test Farm Description',
      address: 'Test Address',
      status: true
    });

    // Create test user with hashed password
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = await User.create({
      email: 'test@example.com',
      fullName: 'Test User',
      password: hashedPassword,
      role: 'farmer',
      status: true,
      farmId: testFarm._id
    });

    // Generate auth token for authenticated requests
    authToken = jwt.sign(
      { id: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.user.fullName).toBe('Test User');
      expect(response.body.data.user.role).toBe('farmer');
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should fail login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should fail login with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should fail login with inactive user', async () => {
      // Create inactive user
      const inactiveUser = await User.create({
        email: 'inactive@example.com',
        fullName: 'Inactive User',
        password: await bcrypt.hash('password123', 10),
        role: 'farmer',
        status: false
      });

      const loginData = {
        email: 'inactive@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should fail login with missing required fields', async () => {
      const loginData = {
        email: 'test@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(500); // Server error when password is undefined

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /auth/me', () => {
    it('should return user profile with farm data for authenticated user', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User retrieved successfully');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('farm');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.fullName).toBe('Test User');
      expect(response.body.data.user.role).toBe('farmer');
      expect(response.body.data.farm.name).toBe('Test Farm');
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app)
        .get('/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });

    it('should return 500 for non-existent user', async () => {
      // Create token for non-existent user
      const fakeToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011', email: 'fake@example.com', role: 'farmer' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Error retrieving user');
    });
  });

  describe('POST /auth/update-profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        fullName: 'Updated Name',
        phone: '1234567890',
        address: 'Updated Address',
        gender: 'male',
        birthday: '1990-01-01'
      };

      const response = await request(app)
        .post('/auth/update-profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
      expect(response.body.data.fullName).toBe(updateData.fullName);
      expect(response.body.data.phone).toBe(updateData.phone);
      expect(response.body.data.address).toBe(updateData.address);
      expect(response.body.data.gender).toBe(updateData.gender);
      expect(response.body.data.birthday).toContain('1990-01-01');
    });

    it('should return 401 without authorization', async () => {
      const updateData = {
        fullName: 'Updated Name',
        phone: '1234567890',
        address: 'Updated Address',
        gender: 'male',
        birthday: '1990-01-01'
      };

      const response = await request(app)
        .post('/auth/update-profile')
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });

    it('should return 400 for missing required fields', async () => {
      const updateData = {
        fullName: 'Updated Name'
        // Missing other required fields
      };

      const response = await request(app)
        .post('/auth/update-profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /auth/change-password', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Password changed successfully');
    });

    it('should fail with incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Current password is incorrect');
    });

    it('should return 401 without authorization', async () => {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .post('/auth/change-password')
        .send(passwordData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });

    it('should return 400 for missing required fields', async () => {
      const passwordData = {
        currentPassword: 'password123'
        // Missing newPassword
      };

      const response = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });
});
