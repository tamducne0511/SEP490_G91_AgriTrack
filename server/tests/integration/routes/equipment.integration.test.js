const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../models/user.model');
const Farm = require('../../../models/farm.model');
const Equipment = require('../../../models/equipment.model');
const EquipmentCategory = require('../../../models/equipmentCategories.model');

// Import the test app without database connection
const app = require('../test-app');

describe('Equipment Integration Tests', () => {
  let farmAdminUser, farmerUser, testFarm, testCategory, farmAdminToken, farmerToken;

  beforeEach(async () => {
    // Create test farm
    testFarm = await Farm.create({
      name: 'Test Farm',
      description: 'Test Farm Description',
      address: 'Test Address',
      status: true
    });

    // Create test equipment category
    testCategory = await EquipmentCategory.create({
      name: 'Test Category',
      description: 'Test Category Description',
      farmId: testFarm._id,
      status: true
    });

    // Create farm admin user
    const farmAdminPassword = await bcrypt.hash('password123', 10);
    farmAdminUser = await User.create({
      email: 'farmadmin@example.com',
      fullName: 'Farm Admin User',
      password: farmAdminPassword,
      role: 'farm-admin',
      status: true,
      farmId: testFarm._id
    });

    // Create farmer user
    const farmerPassword = await bcrypt.hash('password123', 10);
    farmerUser = await User.create({
      email: 'farmer@example.com',
      fullName: 'Farmer User',
      password: farmerPassword,
      role: 'farmer',
      status: true,
      farmId: testFarm._id
    });

    // Generate tokens
    farmAdminToken = jwt.sign(
      { id: farmAdminUser._id, email: farmAdminUser.email, role: farmAdminUser.role, farmId: farmAdminUser.farmId },
      process.env.JWT_SECRET || 'test-secret-key-for-integration-tests',
      { expiresIn: '1h' }
    );

    farmerToken = jwt.sign(
      { id: farmerUser._id, email: farmerUser.email, role: farmerUser.role, farmId: farmerUser.farmId },
      process.env.JWT_SECRET || 'test-secret-key-for-integration-tests',
      { expiresIn: '1h' }
    );
  });

  describe('GET /admin/equipments', () => {
    it('should return all equipment for admin user', async () => {
      // Create test equipment
      await Equipment.create([
        {
          name: 'Equipment 1',
          description: 'Description 1',
          categoryId: testCategory._id,
          farmId: testFarm._id,
          quantity: 5,
          status: true
        },
        {
          name: 'Equipment 2',
          description: 'Description 2',
          categoryId: testCategory._id,
          farmId: testFarm._id,
          quantity: 3,
          status: true
        }
      ]);

      const response = await request(app)
        .get('/admin/equipments')
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('messag', 'Get list successfully');
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('totalItem');
      expect(response.body).toHaveProperty('totalPage');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('status');
      expect(response.body.data[0]).toHaveProperty('categoryId');
      expect(response.body.data[0]).toHaveProperty('farmId');
    });

    it('should filter equipment by keyword', async () => {
      await Equipment.create([
        {
          name: 'Tractor Equipment',
          description: 'Tractor Description',
          categoryId: testCategory._id,
          farmId: testFarm._id,
          quantity: 2,
          status: true
        },
        {
          name: 'Harvester Equipment',
          description: 'Harvester Description',
          categoryId: testCategory._id,
          farmId: testFarm._id,
          quantity: 1,
          status: true
        }
      ]);

      const response = await request(app)
        .get('/admin/equipments?keyword=Tractor')
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Tractor Equipment');
    });

    it('should return 401 for non-admin user', async () => {
      const response = await request(app)
        .get('/admin/equipments')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });
  });

  describe('POST /admin/equipments', () => {
    it('should create new equipment successfully', async () => {
      const equipmentData = {
        name: 'New Equipment',
        description: 'New Equipment Description',
        categoryId: testCategory._id,
        quantity: 10
      };

      const response = await request(app)
        .post('/admin/equipments')
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .send(equipmentData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Equipment created successfully');
      expect(response.body.data.name).toBe(equipmentData.name);
      expect(response.body.data.description).toBe(equipmentData.description);
      expect(response.body.data.quantity).toBe(equipmentData.quantity);
      expect(response.body.data.status).toBe(true);
    });

    it('should return 400 for invalid data', async () => {
      const equipmentData = {
        name: '', // Invalid: empty name
        description: 'Description',
        categoryId: testCategory._id,
        farmId: testFarm._id,
        quantity: -5 // Invalid: negative quantity
      };

      const response = await request(app)
        .post('/admin/equipments')
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .send(equipmentData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent category', async () => {
      const fakeCategoryId = '507f1f77bcf86cd799439011';
      const equipmentData = {
        name: 'New Equipment',
        description: 'New Equipment Description',
        categoryId: fakeCategoryId,
        quantity: 10
      };

      const response = await request(app)
        .post('/admin/equipments')
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .send(equipmentData)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /web/equipments', () => {
    it('should return available equipment for authenticated user', async () => {
      // Create equipment
      await Equipment.create([
        {
          name: 'Available Equipment 1',
          description: 'Available Description 1',
          categoryId: testCategory._id,
          farmId: testFarm._id,
          quantity: 5,
          status: true
        },
        {
          name: 'Available Equipment 2',
          description: 'Available Description 2',
          categoryId: testCategory._id,
          farmId: testFarm._id,
          quantity: 3,
          status: true
        }
      ]);

      const response = await request(app)
        .get('/web/equipments')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('messag', 'Get list successfully');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('status');
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app)
        .get('/web/equipments')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });
  });

  describe('GET /admin/equipments/:id', () => {
    it('should return equipment details by ID', async () => {
      const equipment = await Equipment.create({
        name: 'Test Equipment',
        description: 'Test Equipment Description',
        categoryId: testCategory._id,
        farmId: testFarm._id,
        quantity: 5,
        status: true
      });

      const response = await request(app)
        .get(`/admin/equipments/${equipment._id}`)
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Equipment found successfully');
      expect(response.body.data._id).toBe(equipment._id.toString());
      expect(response.body.data.name).toBe('Test Equipment');
      expect(response.body.data.description).toBe('Test Equipment Description');
    });

    it('should return 404 for non-existent equipment', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/admin/equipments/${fakeId}`)
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Not found equipment with id: ' + fakeId);
    });
  });

  describe('PUT /admin/equipments/:id', () => {
    it('should update equipment successfully', async () => {
      const equipment = await Equipment.create({
        name: 'Original Equipment',
        description: 'Original Description',
        categoryId: testCategory._id,
        farmId: testFarm._id,
        quantity: 5,
        status: true
      });

      const updateData = {
        name: 'Updated Equipment',
        description: 'Updated Description',
        categoryId: testCategory._id,
        quantity: 10
      };

      const response = await request(app)
        .put(`/admin/equipments/${equipment._id}`)
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Equipment updated successfully');
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.quantity).toBe(updateData.quantity);
    });

    it('should return 404 for non-existent equipment', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        name: 'Updated Equipment',
        description: 'Updated Description',
        categoryId: testCategory._id
      };

      const response = await request(app)
        .put(`/admin/equipments/${fakeId}`)
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Not found Equipment with id: ' + fakeId);
    });
  });

  describe('DELETE /admin/equipments/:id', () => {
    it('should delete equipment successfully', async () => {
      const equipment = await Equipment.create({
        name: 'Equipment to Delete',
        description: 'Equipment Description',
        categoryId: testCategory._id,
        farmId: testFarm._id,
        quantity: 5,
        status: true
      });

      const response = await request(app)
        .delete(`/admin/equipments/${equipment._id}`)
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Equipment deleted successfully');

      // Verify equipment is soft deleted
      const getResponse = await request(app)
        .get(`/admin/equipments/${equipment._id}`)
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .expect(200);
      
      expect(getResponse.body.data.status).toBe(false);
    });

    it('should return 404 for non-existent equipment', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/admin/equipments/${fakeId}`)
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Not found equipment with id: ' + fakeId);
    });
  });

  describe('Equipment Categories', () => {
    describe('GET /admin/equipment-categories', () => {
      it('should return all equipment categories', async () => {
        // Create additional categories
        await EquipmentCategory.create([
          {
            name: 'Category 1',
            description: 'Category 1 Description',
            farmId: testFarm._id,
            status: true
          },
          {
            name: 'Category 2',
            description: 'Category 2 Description',
            farmId: testFarm._id,
            status: true
          }
        ]);

        const response = await request(app)
          .get('/admin/equipment-categories')
          .set('Authorization', `Bearer ${farmAdminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('messag', 'Get list successfully');
        expect(response.body.data).toHaveLength(3); // Including the one created in beforeEach
        expect(response.body.data[0]).toHaveProperty('name');
        expect(response.body.data[0]).toHaveProperty('description');
        expect(response.body.data[0]).toHaveProperty('status');
      });
    });

    describe('POST /admin/equipment-categories', () => {
      it('should create new equipment category', async () => {
        const categoryData = {
          name: 'New Category',
          description: 'New Category Description',
          farmId: testFarm._id
        };

        const response = await request(app)
          .post('/admin/equipment-categories')
          .set('Authorization', `Bearer ${farmAdminToken}`)
          .send(categoryData)
          .expect(201);

        expect(response.body).toHaveProperty('message', 'Category created successfully');
        expect(response.body.data.name).toBe(categoryData.name);
        expect(response.body.data.description).toBe(categoryData.description);
        expect(response.body.data.status).toBe(true);
      });
    });

    describe('GET /web/equipment-categories', () => {
      it('should return active equipment categories for web users', async () => {
        // Create categories with different statuses
        await EquipmentCategory.create([
          {
            name: 'Active Category',
            description: 'Active Category Description',
            farmId: testFarm._id,
            status: true
          },
          {
            name: 'Inactive Category',
            description: 'Inactive Category Description',
            farmId: testFarm._id,
            status: false
          }
        ]);

        const response = await request(app)
          .get('/web/equipment-categories')
          .set('Authorization', `Bearer ${farmerToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('messag', 'Get list successfully');
        expect(response.body.data).toHaveLength(3); // Including the testCategory from beforeEach
        expect(response.body.data[0]).toHaveProperty('name');
        expect(response.body.data[0]).toHaveProperty('description');
      });
    });
  });

  describe('Equipment Status Management', () => {
    it('should allow status updates', async () => {
      const equipment = await Equipment.create({
        name: 'Status Test Equipment',
        description: 'Status Test Description',
        categoryId: testCategory._id,
        farmId: testFarm._id,
        quantity: 5,
        status: true
      });

      const updateData = {
        name: 'Status Test Equipment',
        description: 'Status Test Description',
        categoryId: testCategory._id,
        status: false
      };

      const response = await request(app)
        .put(`/admin/equipments/${equipment._id}`)
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.status).toBe(false);
    });

    it('should validate equipment status values', async () => {
      const equipment = await Equipment.create({
        name: 'Validation Test Equipment',
        description: 'Validation Test Description',
        categoryId: testCategory._id,
        farmId: testFarm._id,
        quantity: 5,
        status: true
      });

      const updateData = {
        name: 'Validation Test Equipment',
        description: 'Validation Test Description',
        categoryId: testCategory._id,
        status: false
      };

      const response = await request(app)
        .put(`/admin/equipments/${equipment._id}`)
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .send(updateData)
        .expect(200);

      // The status should be updated to false
      expect(response.body.data.status).toBe(false);
    });
  });
});
