const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../models/user.model');
const Farm = require('../../../models/farm.model');

// Import the test app without database connection
const app = require('../test-app');

describe('User Integration Tests', () => {
  let adminUser, testFarm, adminToken;

  beforeEach(async () => {
    // Create test farm
    testFarm = await Farm.create({
      name: 'Test Farm',
      description: 'Test Farm Description',
      address: 'Test Address',
      status: true
    });

    // Create admin user
    const adminPassword = await bcrypt.hash('password123', 10);
    adminUser = await User.create({
      email: 'admin@example.com',
      fullName: 'Admin User',
      password: adminPassword,
      role: 'admin',
      status: true
    });

    // Generate admin token
    adminToken = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('GET /admin/users', () => {
    it('should return all users for admin', async () => {
      // Create additional users
      await User.create([
        {
          email: 'farmer1@example.com',
          fullName: 'Farmer 1',
          password: await bcrypt.hash('password123', 10),
          role: 'farmer',
          status: true,
          farmId: testFarm._id
        },
        {
          email: 'expert1@example.com',
          fullName: 'Expert 1',
          password: await bcrypt.hash('password123', 10),
          role: 'expert',
          status: true
        },
        {
          email: 'farmadmin1@example.com',
          fullName: 'Farm Admin 1',
          password: await bcrypt.hash('password123', 10),
          role: 'farm_admin',
          status: true
        }
      ]);

      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('messag', 'Get list successfully');
      expect(response.body.data).toHaveLength(4); // Including admin user
      expect(response.body.data[0]).toHaveProperty('email');
      expect(response.body.data[0]).toHaveProperty('fullName');
      expect(response.body.data[0]).toHaveProperty('role');
      expect(response.body.data[0]).toHaveProperty('status');
    });

    it('should filter users by role', async () => {
      await User.create([
        {
          email: 'farmer1@example.com',
          fullName: 'Farmer 1',
          password: await bcrypt.hash('password123', 10),
          role: 'farmer',
          status: true,
          farmId: testFarm._id
        },
        {
          email: 'farmer2@example.com',
          fullName: 'Farmer 2',
          password: await bcrypt.hash('password123', 10),
          role: 'farmer',
          status: true,
          farmId: testFarm._id
        },
        {
          email: 'expert1@example.com',
          fullName: 'Expert 1',
          password: await bcrypt.hash('password123', 10),
          role: 'expert',
          status: true
        }
      ]);

      const response = await request(app)
        .get('/admin/users?role=farmer')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.every(user => user.role === 'farmer')).toBe(true);
    });

    it('should filter users by status', async () => {
      await User.create([
        {
          email: 'active@example.com',
          fullName: 'Active User',
          password: await bcrypt.hash('password123', 10),
          role: 'farmer',
          status: true,
          farmId: testFarm._id
        },
        {
          email: 'inactive@example.com',
          fullName: 'Inactive User',
          password: await bcrypt.hash('password123', 10),
          role: 'farmer',
          status: false,
          farmId: testFarm._id
        }
      ]);

      const response = await request(app)
        .get('/admin/users?status=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.every(user => user.status === true)).toBe(true);
    });

    it('should return 403 for non-admin user', async () => {
      // Create a farmer user and token
      const farmerPassword = await bcrypt.hash('password123', 10);
      const farmerUser = await User.create({
        email: 'farmer@example.com',
        fullName: 'Farmer User',
        password: farmerPassword,
        role: 'farmer',
        status: true,
        farmId: testFarm._id
      });

      const farmerToken = jwt.sign(
        { id: farmerUser._id, email: farmerUser.email, role: farmerUser.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Access denied');
    });
  });

  describe('POST /admin/users', () => {
    it('should create new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        fullName: 'New User',
        password: 'password123',
        role: 'farmer',
        status: true,
        farmId: testFarm._id,
        phone: '1234567890',
        address: 'Test Address',
        gender: 'male',
        birthday: '1990-01-01'
      };

      const response = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.fullName).toBe(userData.fullName);
      expect(response.body.data.role).toBe(userData.role);
      expect(response.body.data.status).toBe(userData.status);
      expect(response.body.data.password).toBeUndefined(); // Password should not be returned
    });

    it('should return 400 for invalid email format', async () => {
      const invalidData = {
        email: 'invalid-email',
        fullName: 'Test User',
        password: 'password123',
        role: 'farmer',
        status: true
      };

      const response = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for duplicate email', async () => {
      // First user
      const userData1 = {
        email: 'duplicate@example.com',
        fullName: 'User 1',
        password: 'password123',
        role: 'farmer',
        status: true
      };

      await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData1)
        .expect(201);

      // Second user with same email
      const userData2 = {
        email: 'duplicate@example.com',
        fullName: 'User 2',
        password: 'password123',
        role: 'expert',
        status: true
      };

      const response = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData2)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Email already exists');
    });

    it('should return 400 for invalid role', async () => {
      const invalidData = {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
        role: 'invalid_role',
        status: true
      };

      const response = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 404 for non-existent farm when assigning farmer', async () => {
      const nonExistentFarmId = '507f1f77bcf86cd799439011';
      const userData = {
        email: 'farmer@example.com',
        fullName: 'Farmer User',
        password: 'password123',
        role: 'farmer',
        status: true,
        farmId: nonExistentFarmId
      };

      const response = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Farm not found');
    });
  });

  describe('GET /admin/users/:id', () => {
    it('should return user details by ID', async () => {
      const user = await User.create({
        email: 'testuser@example.com',
        fullName: 'Test User',
        password: await bcrypt.hash('password123', 10),
        role: 'farmer',
        status: true,
        farmId: testFarm._id
      });

      const response = await request(app)
        .get(`/admin/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Get user detail successfully');
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data.fullName).toBe(user.fullName);
      expect(response.body.data.role).toBe(user.role);
      expect(response.body.data.password).toBeUndefined(); // Password should not be returned
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/admin/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('PUT /admin/users/:id', () => {
    it('should update user successfully', async () => {
      const user = await User.create({
        email: 'updateuser@example.com',
        fullName: 'Original Name',
        password: await bcrypt.hash('password123', 10),
        role: 'farmer',
        status: true,
        farmId: testFarm._id
      });

      const updateData = {
        fullName: 'Updated Name',
        phone: '9876543210',
        address: 'Updated Address',
        gender: 'female',
        birthday: '1985-05-15',
        status: false
      };

      const response = await request(app)
        .put(`/admin/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User updated successfully');
      expect(response.body.data.fullName).toBe(updateData.fullName);
      expect(response.body.data.phone).toBe(updateData.phone);
      expect(response.body.data.address).toBe(updateData.address);
      expect(response.body.data.gender).toBe(updateData.gender);
      expect(response.body.data.birthday).toBe(updateData.birthday);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateData = { fullName: 'Updated Name' };

      const response = await request(app)
        .put(`/admin/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should not allow updating email to existing email', async () => {
      // Create first user
      const user1 = await User.create({
        email: 'user1@example.com',
        fullName: 'User 1',
        password: await bcrypt.hash('password123', 10),
        role: 'farmer',
        status: true
      });

      // Create second user
      const user2 = await User.create({
        email: 'user2@example.com',
        fullName: 'User 2',
        password: await bcrypt.hash('password123', 10),
        role: 'expert',
        status: true
      });

      // Try to update user2's email to user1's email
      const updateData = { email: 'user1@example.com' };

      const response = await request(app)
        .put(`/admin/users/${user2._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Email already exists');
    });
  });

  describe('DELETE /admin/users/:id', () => {
    it('should delete user successfully', async () => {
      const user = await User.create({
        email: 'deleteuser@example.com',
        fullName: 'User to Delete',
        password: await bcrypt.hash('password123', 10),
        role: 'farmer',
        status: true,
        farmId: testFarm._id
      });

      const response = await request(app)
        .delete(`/admin/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User deleted successfully');

      // Verify user is deleted
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/admin/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should not allow deleting admin user', async () => {
      const response = await request(app)
        .delete(`/admin/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Cannot delete admin user');
    });
  });

  describe('User Role Management', () => {
    it('should handle different user roles', async () => {
      const roles = ['farmer', 'expert', 'farm_admin'];
      const users = [];

      for (const role of roles) {
        const userData = {
          email: `${role}@example.com`,
          fullName: `${role} User`,
          password: 'password123',
          role: role,
          status: true
        };

        if (role === 'farmer') {
          userData.farmId = testFarm._id;
        }

        const response = await request(app)
          .post('/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(userData)
          .expect(201);

        expect(response.body.data.role).toBe(role);
        users.push(response.body.data);
      }

      // Verify all users were created
      expect(users).toHaveLength(3);
    });

    it('should validate role assignments', async () => {
      const invalidRoleData = {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
        role: 'invalid_role',
        status: true
      };

      const response = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidRoleData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('User Status Management', () => {
    it('should allow status updates', async () => {
      const user = await User.create({
        email: 'statususer@example.com',
        fullName: 'Status User',
        password: await bcrypt.hash('password123', 10),
        role: 'farmer',
        status: true,
        farmId: testFarm._id
      });

      // Deactivate user
      const deactivateResponse = await request(app)
        .put(`/admin/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: false })
        .expect(200);

      expect(deactivateResponse.body.data.status).toBe(false);

      // Reactivate user
      const activateResponse = await request(app)
        .put(`/admin/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: true })
        .expect(200);

      expect(activateResponse.body.data.status).toBe(true);
    });
  });
});
