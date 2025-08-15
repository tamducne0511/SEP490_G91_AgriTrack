const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../models/user.model');
const Farm = require('../../../models/farm.model');
const Garden = require('../../../models/garden.model');
const Task = require('../../../models/task.model');
const Equipment = require('../../../models/equipment.model');

// Import the test app without database connection
const app = require('../test-app');

describe('Task Integration Tests', () => {
  let adminUser, farmerUser, expertUser, testFarm, testGarden, testEquipment;
  let adminToken, farmerToken, expertToken;

  beforeEach(async () => {
    // Create test farm
    testFarm = await Farm.create({
      name: 'Test Farm',
      description: 'Test Farm Description',
      address: 'Test Address',
      status: true
    });

    // Create test equipment category first
    const EquipmentCategory = require('../../../models/equipmentCategories.model');
    const testCategory = await EquipmentCategory.create({
      name: 'Test Category',
      description: 'Test Category Description',
      farmId: testFarm._id,
      status: true
    });

    // Create test garden
    testGarden = await Garden.create({
      name: 'Test Garden',
      description: 'Test Garden Description',
      farmId: testFarm._id,
      status: true
    });

    // Create test equipment
    testEquipment = await Equipment.create({
      name: 'Test Equipment',
      description: 'Test Equipment Description',
      status: true,
      categoryId: testCategory._id,
      farmId: testFarm._id,
      quantity: 10
    });

    // Create farm admin user
    const adminPassword = await bcrypt.hash('password123', 10);
    adminUser = await User.create({
      email: 'farmadmin@example.com',
      fullName: 'Farm Admin User',
      password: adminPassword,
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

    // Create expert user
    const expertPassword = await bcrypt.hash('password123', 10);
    expertUser = await User.create({
      email: 'expert@example.com',
      fullName: 'Expert User',
      password: expertPassword,
      role: 'expert',
      status: true
    });

    // Generate tokens
    adminToken = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: adminUser.role, farmId: adminUser.farmId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    farmerToken = jwt.sign(
      { id: farmerUser._id, email: farmerUser.email, role: farmerUser.role, farmId: farmerUser.farmId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    expertToken = jwt.sign(
      { id: expertUser._id, email: expertUser.email, role: expertUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('GET /admin/tasks', () => {
    it('should return all tasks for admin user', async () => {
      // Create test tasks
      await Task.create([
        {
          name: 'Task 1',
          description: 'Description 1',
          farmId: testFarm._id,
          gardenId: testGarden._id,
          farmerId: farmerUser._id,
          status: 'un-assign',
          priority: 'high',
          type: 'collect'
        },
        {
          name: 'Task 2',
          description: 'Description 2',
          farmId: testFarm._id,
          gardenId: testGarden._id,
          farmerId: farmerUser._id,
          status: 'in_progress',
          priority: 'medium',
          type: 'collect'
        }
      ]);

      const response = await request(app)
        .get('/admin/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('messag', 'Get list successfully');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('status');
      expect(response.body.data[0]).toHaveProperty('priority');
    });

    it('should return 401 for non-admin user', async () => {
      const response = await request(app)
        .get('/admin/tasks')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });

    it('should filter tasks by status', async () => {
      await Task.create([
        {
          name: 'Pending Task',
          description: 'Pending Description',
          farmId: testFarm._id,
          gardenId: testGarden._id,
          farmerId: farmerUser._id,
          status: 'pending',
          priority: 'high',
          type: 'collect'
        },
        {
          name: 'Completed Task',
          description: 'Completed Description',
          farmId: testFarm._id,
          gardenId: testGarden._id,
          farmerId: farmerUser._id,
          status: 'completed',
          priority: 'medium',
          type: 'collect'
        }
      ]);

      const response = await request(app)
        .get('/admin/tasks?status=pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.some(task => task.status === 'pending')).toBe(true);
    });
  });

  describe('POST /admin/tasks', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        name: 'New Task',
        description: 'New Task Description',
        farmId: testFarm._id,
        gardenId: testGarden._id,
        farmerId: farmerUser._id,
        status: 'un-assign',
        priority: 'high',
        type: 'collect'
      };

      const response = await request(app)
        .post('/admin/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Task created successfully');
      expect(response.body.data.name).toBe(taskData.name);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.status).toBe(taskData.status);
      expect(response.body.data.priority).toBe(taskData.priority);
    });

    it('should return 401 for non-admin user', async () => {
      const taskData = {
        name: 'New Task',
        description: 'New Task Description',
        farmId: testFarm._id,
        gardenId: testGarden._id,
        farmerId: farmerUser._id
      };

      const response = await request(app)
        .post('/admin/tasks')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(taskData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });

    it('should return 400 for invalid data', async () => {
      const taskData = {
        name: '', // Invalid: empty name
        description: 'Description',
        farmId: testFarm._id,
        gardenId: testGarden._id,
        farmerId: farmerUser._id
      };

      const response = await request(app)
        .post('/admin/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /web/tasks', () => {
    it('should return tasks for farmer user', async () => {
      // Create tasks assigned to the farmer
      await Task.create([
        {
          name: 'Farmer Task 1',
          description: 'Farmer Task Description 1',
          farmId: testFarm._id,
          gardenId: testGarden._id,
          farmerId: farmerUser._id,
          status: 'un-assign',
          priority: 'high',
          type: 'collect'
        },
        {
          name: 'Farmer Task 2',
          description: 'Farmer Task Description 2',
          farmId: testFarm._id,
          gardenId: testGarden._id,
          farmerId: farmerUser._id,
          status: 'in_progress',
          priority: 'medium',
          type: 'collect'
        }
      ]);

      const response = await request(app)
        .get('/web/tasks')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('messag', 'Get list successfully');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].farmerId).toBe(farmerUser._id.toString());
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app)
        .get('/web/tasks')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });
  });

  describe('GET /admin/tasks/:id', () => {
    it('should return task details by ID', async () => {
      const task = await Task.create({
        name: 'Test Task',
        description: 'Test Description',
        farmId: testFarm._id,
        gardenId: testGarden._id,
        farmerId: farmerUser._id,
        status: 'un-assign',
        priority: 'high',
        type: 'collect'
      });

      const response = await request(app)
        .get(`/admin/tasks/${task._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Task found successfully');
      expect(response.body.data._id).toBe(task._id.toString());
      expect(response.body.data.name).toBe('Test Task');
      expect(response.body.data.description).toBe('Test Description');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/admin/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Not found task with id: ' + fakeId);
    });
  });

  describe('PUT /admin/tasks/:id', () => {
    it('should update task successfully', async () => {
      const task = await Task.create({
        name: 'Original Task',
        description: 'Original Description',
        farmId: testFarm._id,
        gardenId: testGarden._id,
        farmerId: farmerUser._id,
        status: 'un-assign',
        priority: 'low',
        type: 'collect'
      });

      const updateData = {
        name: 'Updated Task',
        description: 'Updated Description',
        gardenId: testGarden._id,
        type: 'collect',
        priority: 'high',
        status: 'in_progress'
      };

      const response = await request(app)
        .put(`/admin/tasks/${task._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Task updated successfully');
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.status).toBe('in_progress');
      expect(response.body.data.priority).toBe(updateData.priority);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        name: 'Updated Task',
        description: 'Updated Description',
        gardenId: testGarden._id,
        type: 'collect',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/admin/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Not found task with id: ' + fakeId);
    });
  });

  describe('DELETE /admin/tasks/:id', () => {
    it('should delete task successfully', async () => {
      const task = await Task.create({
        name: 'Task to Delete',
        description: 'Task Description',
        farmId: testFarm._id,
        gardenId: testGarden._id,
        farmerId: farmerUser._id,
        status: 'un-assign',
        priority: 'medium',
        type: 'collect'
      });

      const response = await request(app)
        .delete(`/admin/tasks/${task._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Task deleted successfully');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/admin/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Not found task with id: ' + fakeId);
    });
  });
});
