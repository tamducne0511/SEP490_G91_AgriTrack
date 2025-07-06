const request = require('supertest');
const app = require('../../app');
const { createTestUser, generateToken, getAuthHeaders, createTestTask, createObjectId } = require('../utils/testUtils');
const taskService = require('../../services/task.service');

// Mock the task service
jest.mock('../../services/task.service');

describe('Task Controller', () => {
  let farmAdminUser;
  let farmAdminToken;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Create farm admin user for testing with proper ObjectId
    const farmId = createObjectId();
    farmAdminUser = await createTestUser({
      role: 'farm-admin',
      email: 'farmadmin@test.com',
      farmId: farmId
    });
    farmAdminToken = generateToken(farmAdminUser);
  });

  describe('GET /admin/tasks', () => {
    it('should get list of tasks with pagination', async () => {
      const mockTasks = [
        { _id: '1', name: 'Task 1', description: 'Description 1' },
        { _id: '2', name: 'Task 2', description: 'Description 2' }
      ];
      const mockTotal = 2;

      taskService.getListPagination.mockResolvedValue(mockTasks);
      taskService.getTotal.mockResolvedValue(mockTotal);

      const response = await request(app)
        .get('/admin/tasks?page=1&keyword=test')
        .set(getAuthHeaders(farmAdminToken));

      expect(response.status).toBe(200);
      expect(taskService.getListPagination).toHaveBeenCalledWith(farmAdminUser.farmId.toString(), 1, 'test');
      expect(taskService.getTotal).toHaveBeenCalledWith(farmAdminUser.farmId.toString(), 'test');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toEqual(mockTasks);
      expect(response.body.pagination.total).toBe(mockTotal);
    });

    it('should get list with default pagination values', async () => {
      const mockTasks = [];
      const mockTotal = 0;

      taskService.getListPagination.mockResolvedValue(mockTasks);
      taskService.getTotal.mockResolvedValue(mockTotal);

      const response = await request(app)
        .get('/admin/tasks')
        .set(getAuthHeaders(farmAdminToken));

      expect(response.status).toBe(200);
      expect(taskService.getListPagination).toHaveBeenCalledWith(farmAdminUser.farmId.toString(), 1, '');
      expect(taskService.getTotal).toHaveBeenCalledWith(farmAdminUser.farmId.toString(), '');
    });
  });

  describe('POST /admin/tasks', () => {
    it('should create task successfully with valid data', async () => {
      const taskData = {
        name: 'New Task',
        description: 'Test task description',
        type: 'maintenance',
        priority: 'high',
        gardenId: 'garden1'
      };

      const mockCreatedTask = {
        _id: '1',
        ...taskData,
        farmId: farmAdminUser.farmId.toString(),
        image: ''
      };

      taskService.create.mockResolvedValue(mockCreatedTask);

      const response = await request(app)
        .post('/admin/tasks')
        .set(getAuthHeaders(farmAdminToken))
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.data).toEqual(mockCreatedTask);
      expect(taskService.create).toHaveBeenCalledWith({
        name: taskData.name,
        description: taskData.description,
        type: taskData.type,
        priority: taskData.priority,
        gardenId: taskData.gardenId,
        farmId: farmAdminUser.farmId.toString(),
        image: ''
      });
    });

    it('should create task with image when file is uploaded', async () => {
      const taskData = {
        name: 'New Task',
        description: 'Test task description',
        type: 'maintenance',
        priority: 'high',
        gardenId: 'garden1'
      };

      const mockCreatedTask = {
        _id: '1',
        ...taskData,
        farmId: farmAdminUser.farmId.toString(),
        image: '/uploads/tasks/test-image.jpg'
      };

      taskService.create.mockResolvedValue(mockCreatedTask);

      const response = await request(app)
        .post('/admin/tasks')
        .set(getAuthHeaders(farmAdminToken))
        .field('name', taskData.name)
        .field('description', taskData.description)
        .field('type', taskData.type)
        .field('priority', taskData.priority)
        .field('gardenId', taskData.gardenId)
        .attach('image', Buffer.from('fake-image'), 'test-image.jpg');

      expect(response.status).toBe(201);
      expect(taskService.create).toHaveBeenCalledWith({
        name: taskData.name,
        description: taskData.description,
        type: taskData.type,
        priority: taskData.priority,
        gardenId: taskData.gardenId,
        farmId: farmAdminUser.farmId.toString(),
        image: '/uploads/tasks/test-image.jpg'
      });
    });

    it('should fail with validation errors', async () => {
      const invalidData = {
        name: '', // Empty name should fail validation
        description: 'Test description',
        type: 'invalid-type',
        priority: 'invalid-priority'
      };

      const response = await request(app)
        .post('/admin/tasks')
        .set(getAuthHeaders(farmAdminToken))
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /admin/tasks/:id', () => {
    it('should update task successfully with valid data', async () => {
      const taskId = '1';
      const updateData = {
        name: 'Updated Task',
        description: 'Updated description',
        type: 'harvesting',
        priority: 'medium',
        gardenId: 'garden2'
      };

      const mockUpdatedTask = {
        _id: taskId,
        ...updateData,
        image: ''
      };

      taskService.update.mockResolvedValue(mockUpdatedTask);

      const response = await request(app)
        .put(`/admin/tasks/${taskId}`)
        .set(getAuthHeaders(farmAdminToken))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task updated successfully');
      expect(response.body.data).toEqual(mockUpdatedTask);
      expect(taskService.update).toHaveBeenCalledWith(taskId, {
        name: updateData.name,
        description: updateData.description,
        type: updateData.type,
        priority: updateData.priority,
        gardenId: updateData.gardenId,
        image: ''
      });
    });

    it('should fail with validation errors', async () => {
      const taskId = '1';
      const invalidData = {
        name: '', // Empty name should fail validation
        description: 'Updated description',
        type: 'invalid-type'
      };

      const response = await request(app)
        .put(`/admin/tasks/${taskId}`)
        .set(getAuthHeaders(farmAdminToken))
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should handle service errors', async () => {
      const taskId = '1';
      const updateData = {
        name: 'Updated Task',
        description: 'Updated description'
      };

      taskService.update.mockRejectedValue(new Error('Task not found'));

      const response = await request(app)
        .put(`/admin/tasks/${taskId}`)
        .set(getAuthHeaders(farmAdminToken))
        .send(updateData);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /admin/tasks/:id', () => {
    it('should delete task successfully', async () => {
      const taskId = '1';
      const mockTask = { _id: taskId, name: 'Test Task' };

      taskService.find.mockResolvedValue(mockTask);
      taskService.remove.mockResolvedValue({ deletedCount: 1 });

      const response = await request(app)
        .delete(`/admin/tasks/${taskId}`)
        .set(getAuthHeaders(farmAdminToken));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task deleted successfully');
      expect(taskService.find).toHaveBeenCalledWith(taskId);
      expect(taskService.remove).toHaveBeenCalledWith(taskId);
    });

    it('should fail when task not found', async () => {
      const taskId = '1';

      taskService.find.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/admin/tasks/${taskId}`)
        .set(getAuthHeaders(farmAdminToken));

      expect(response.status).toBe(404);
    });
  });

  describe('GET /admin/tasks/:id', () => {
    it('should get task detail successfully', async () => {
      const taskId = '1';
      const mockTask = { _id: taskId, name: 'Test Task', description: 'Test Description' };

      taskService.find.mockResolvedValue(mockTask);

      const response = await request(app)
        .get(`/admin/tasks/${taskId}`)
        .set(getAuthHeaders(farmAdminToken));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task found successfully');
      expect(response.body.data).toEqual(mockTask);
      expect(taskService.find).toHaveBeenCalledWith(taskId);
    });

    it('should fail when task not found', async () => {
      const taskId = '1';

      taskService.find.mockResolvedValue(null);

      const response = await request(app)
        .get(`/admin/tasks/${taskId}`)
        .set(getAuthHeaders(farmAdminToken));

      expect(response.status).toBe(404);
    });
  });

  describe('POST /admin/tasks/:id/assign', () => {
    it('should assign farmer to task successfully', async () => {
      const taskId = '1';
      const farmerId = 'farmer1';
      const mockResult = {
        task: { _id: taskId, name: 'Test Task' },
        farmer: { _id: farmerId, fullName: 'Test Farmer' }
      };

      taskService.assignFarmer.mockResolvedValue(mockResult);

      const response = await request(app)
        .post(`/admin/tasks/${taskId}/assign`)
        .set(getAuthHeaders(farmAdminToken))
        .send({ farmerId });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Assigned farmer to task successfully');
      expect(response.body.data).toEqual(mockResult);
      expect(taskService.assignFarmer).toHaveBeenCalledWith(taskId, farmerId);
    });

    it('should fail with missing farmerId', async () => {
      const taskId = '1';

      const response = await request(app)
        .post(`/admin/tasks/${taskId}/assign`)
        .set(getAuthHeaders(farmAdminToken))
        .send({});

      expect(response.status).toBe(400);
    });
  });
}); 