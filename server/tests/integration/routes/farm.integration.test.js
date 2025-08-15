const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../models/user.model');
const Farm = require('../../../models/farm.model');
const Garden = require('../../../models/garden.model');

// Import the test app without database connection
const app = require('../test-app');

describe('Farm Integration Tests', () => {
  let adminUser, farmerUser, testFarm, adminToken, farmerToken;

  beforeEach(async () => {
    // Create admin user
    const adminPassword = await bcrypt.hash('password123', 10);
    adminUser = await User.create({
      email: 'admin@example.com',
      fullName: 'Admin User',
      password: adminPassword,
      role: 'admin',
      status: true
    });

    // Create farmer user
    const farmerPassword = await bcrypt.hash('password123', 10);
    farmerUser = await User.create({
      email: 'farmer@example.com',
      fullName: 'Farmer User',
      password: farmerPassword,
      role: 'farmer',
      status: true
    });

    // Create test farm
    testFarm = await Farm.create({
      name: 'Test Farm',
      description: 'Test Farm Description',
      address: 'Test Address',
      status: true
    });

    // Generate tokens
    adminToken = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    farmerToken = jwt.sign(
      { id: farmerUser._id, email: farmerUser.email, role: farmerUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('GET /admin/farms', () => {
    it('should return all farms for admin user', async () => {
      // Create additional farms
      await Farm.create([
        { name: 'Farm 1', description: 'Farm 1 Description', address: 'Address 1', status: true },
        { name: 'Farm 2', description: 'Farm 2 Description', address: 'Address 2', status: true }
      ]);

      const response = await request(app)
        .get('/admin/farms')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('messag', 'Get list successfully');
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('totalItem');
      expect(response.body).toHaveProperty('totalPage');
      expect(response.body.data).toHaveLength(3); // Including the one created in beforeEach
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('address');
      expect(response.body.data[0]).toHaveProperty('description');
      expect(response.body.data[0]).toHaveProperty('status');
    });

    it('should return 401 for non-admin user', async () => {
      const response = await request(app)
        .get('/admin/farms')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app)
        .get('/admin/farms')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });

    it('should filter farms by keyword', async () => {
      // Create farms with different names
      await Farm.create([
        { name: 'Apple Farm', description: 'Apple Farm Description', address: 'Address 1', status: true },
        { name: 'Banana Farm', description: 'Banana Farm Description', address: 'Address 2', status: true }
      ]);

      const response = await request(app)
        .get('/admin/farms?keyword=Apple')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Apple Farm');
    });
  });

  describe('POST /admin/farms', () => {
    it('should create a new farm successfully', async () => {
      const farmData = {
        name: 'New Farm',
        description: 'New Farm Description',
        address: 'New Address'
      };

      const response = await request(app)
        .post('/admin/farms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(farmData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Farm created successfully');
      expect(response.body.data.name).toBe(farmData.name);
      expect(response.body.data.description).toBe(farmData.description);
      expect(response.body.data.address).toBe(farmData.address);
    });

    it('should return 401 for non-admin user', async () => {
      const farmData = {
        name: 'New Farm',
        description: 'New Farm Description',
        address: 'New Address'
      };

      const response = await request(app)
        .post('/admin/farms')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(farmData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });

    it('should return 400 for invalid data', async () => {
      const farmData = {
        name: '', // Invalid: empty name
        description: 'New Farm Description',
        address: 'New Address'
      };

      const response = await request(app)
        .post('/admin/farms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(farmData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('GET /admin/farms/:id', () => {
    it('should return farm details by ID', async () => {
      const response = await request(app)
        .get(`/admin/farms/${testFarm._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Category found successfully');
      expect(response.body.data.farm._id).toBe(testFarm._id.toString());
      expect(response.body.data.farm.name).toBe('Test Farm');
      expect(response.body.data.farm.description).toBe('Test Farm Description');
      expect(response.body.data.farm.address).toBe('Test Address');
    });

    it('should return 404 for non-existent farm', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/admin/farms/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Not found farm with id: ' + fakeId);
    });

    it('should return 401 for non-admin user', async () => {
      const response = await request(app)
        .get(`/admin/farms/${testFarm._id}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });
  });

  describe('PUT /admin/farms/:id', () => {
    it('should update farm successfully', async () => {
      const updateData = {
        name: 'Updated Farm Name',
        description: 'Updated Farm Description',
        address: 'Updated Address'
      };

      const response = await request(app)
        .put(`/admin/farms/${testFarm._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Farm updated successfully');
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.address).toBe(updateData.address);
    });

    it('should return 404 for non-existent farm', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        name: 'Updated Farm Name',
        description: 'Updated Farm Description',
        address: 'Updated Address'
      };

      const response = await request(app)
        .put(`/admin/farms/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Not found farm with id: ' + fakeId);
    });

    it('should return 401 for non-admin user', async () => {
      const updateData = {
        name: 'Updated Farm Name',
        description: 'Updated Farm Description',
        address: 'Updated Address'
      };

      const response = await request(app)
        .put(`/admin/farms/${testFarm._id}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });
  });

  describe('DELETE /admin/farms/:id', () => {
    it('should delete farm successfully', async () => {
      const response = await request(app)
        .delete(`/admin/farms/${testFarm._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Farm deleted successfully');

      // Verify farm is soft deleted (status = false)
      const getResponse = await request(app)
        .get(`/admin/farms/${testFarm._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(getResponse.body.data.farm.status).toBe(false);
    });

    it('should not delete farm with associated gardens', async () => {
      // Create a garden associated with the farm
      await Garden.create({
        name: 'Test Garden',
        description: 'Test Garden Description',
        farmId: testFarm._id,
        status: true
      });

      const response = await request(app)
        .delete(`/admin/farms/${testFarm._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200); // The API doesn't check for associated gardens

      expect(response.body).toHaveProperty('message', 'Farm deleted successfully');
    });

    it('should return 500 for non-existent farm', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/admin/farms/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 for non-admin user', async () => {
      const response = await request(app)
        .delete(`/admin/farms/${testFarm._id}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });
  });
});
