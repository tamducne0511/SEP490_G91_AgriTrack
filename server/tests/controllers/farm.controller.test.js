const request = require('supertest');
const app = require('../../app');
const { createTestUser, generateToken, getAuthHeaders, createTestFarm, createObjectId } = require('../utils/testUtils');
const farmService = require('../../services/farm.service');

// Mock the farm service
jest.mock('../../services/farm.service');

describe('Farm Controller', () => {
  let adminUser;
  let adminToken;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Create admin user for testing
    adminUser = await createTestUser({
      role: 'admin',
      email: 'admin@test.com'
    });
    adminToken = generateToken(adminUser);
  });

  describe('GET /admin/farms', () => {
    it('should get list of farms with pagination', async () => {
      const mockFarms = [
        { _id: '1', name: 'Farm 1', address: 'Address 1' },
        { _id: '2', name: 'Farm 2', address: 'Address 2' }
      ];
      const mockTotal = 2;

      farmService.getListPagination.mockResolvedValue(mockFarms);
      farmService.getTotal.mockResolvedValue(mockTotal);

      const response = await request(app)
        .get('/admin/farms?page=1&keyword=test')
        .set(getAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(farmService.getListPagination).toHaveBeenCalledWith(1, 'test');
      expect(farmService.getTotal).toHaveBeenCalledWith('test');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toEqual(mockFarms);
      expect(response.body.pagination.total).toBe(mockTotal);
    });

    it('should get list with default pagination values', async () => {
      const mockFarms = [];
      const mockTotal = 0;

      farmService.getListPagination.mockResolvedValue(mockFarms);
      farmService.getTotal.mockResolvedValue(mockTotal);

      const response = await request(app)
        .get('/admin/farms')
        .set(getAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(farmService.getListPagination).toHaveBeenCalledWith(1, '');
      expect(farmService.getTotal).toHaveBeenCalledWith('');
    });
  });

  describe('POST /admin/farms', () => {
    it('should create farm successfully with valid data', async () => {
      const farmData = {
        name: 'New Farm',
        description: 'Test farm description',
        address: 'Test Address'
      };

      const mockCreatedFarm = {
        _id: '1',
        ...farmData,
        image: ''
      };

      farmService.create.mockResolvedValue(mockCreatedFarm);

      const response = await request(app)
        .post('/admin/farms')
        .set(getAuthHeaders(adminToken))
        .send(farmData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Farm created successfully');
      expect(response.body.data).toEqual(mockCreatedFarm);
      expect(farmService.create).toHaveBeenCalledWith({
        name: farmData.name,
        description: farmData.description,
        address: farmData.address,
        image: ''
      });
    });

    it('should create farm with image when file is uploaded', async () => {
      const farmData = {
        name: 'New Farm',
        description: 'Test farm description',
        address: 'Test Address'
      };

      const mockCreatedFarm = {
        _id: '1',
        ...farmData,
        image: '/uploads/farms/test-image.jpg'
      };

      farmService.create.mockResolvedValue(mockCreatedFarm);

      const response = await request(app)
        .post('/admin/farms')
        .set(getAuthHeaders(adminToken))
        .field('name', farmData.name)
        .field('description', farmData.description)
        .field('address', farmData.address)
        .attach('image', Buffer.from('fake-image'), 'test-image.jpg');

      expect(response.status).toBe(201);
      expect(farmService.create).toHaveBeenCalledWith({
        name: farmData.name,
        description: farmData.description,
        address: farmData.address,
        image: '/uploads/farms/test-image.jpg'
      });
    });

    it('should fail with validation errors', async () => {
      const invalidData = {
        name: '', // Empty name should fail validation
        description: 'Test description',
        address: 'Test Address'
      };

      const response = await request(app)
        .post('/admin/farms')
        .set(getAuthHeaders(adminToken))
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /admin/farms/:id', () => {
    it('should update farm successfully with valid data', async () => {
      const farmId = '1';
      const updateData = {
        name: 'Updated Farm',
        description: 'Updated description',
        address: 'Updated Address'
      };

      const mockUpdatedFarm = {
        _id: farmId,
        ...updateData,
        image: ''
      };

      farmService.update.mockResolvedValue(mockUpdatedFarm);

      const response = await request(app)
        .put(`/admin/farms/${farmId}`)
        .set(getAuthHeaders(adminToken))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Farm updated successfully');
      expect(response.body.data).toEqual(mockUpdatedFarm);
      expect(farmService.update).toHaveBeenCalledWith(farmId, {
        name: updateData.name,
        description: updateData.description,
        address: updateData.address,
        image: ''
      });
    });

    it('should fail with validation errors', async () => {
      const farmId = '1';
      const invalidData = {
        name: '', // Empty name should fail validation
        description: 'Updated description',
        address: 'Updated Address'
      };

      const response = await request(app)
        .put(`/admin/farms/${farmId}`)
        .set(getAuthHeaders(adminToken))
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should handle service errors', async () => {
      const farmId = '1';
      const updateData = {
        name: 'Updated Farm',
        description: 'Updated description',
        address: 'Updated Address'
      };

      farmService.update.mockRejectedValue(new Error('Farm not found'));

      const response = await request(app)
        .put(`/admin/farms/${farmId}`)
        .set(getAuthHeaders(adminToken))
        .send(updateData);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /admin/farms/:id', () => {
    it('should delete farm successfully', async () => {
      const farmId = '1';
      const mockFarm = { _id: farmId, name: 'Test Farm' };

      farmService.find.mockResolvedValue(mockFarm);
      farmService.remove.mockResolvedValue({ deletedCount: 1 });

      const response = await request(app)
        .delete(`/admin/farms/${farmId}`)
        .set(getAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Farm deleted successfully');
      expect(farmService.find).toHaveBeenCalledWith(farmId);
      expect(farmService.remove).toHaveBeenCalledWith(farmId);
    });

    it('should fail when farm not found', async () => {
      const farmId = '1';

      farmService.find.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/admin/farms/${farmId}`)
        .set(getAuthHeaders(adminToken));

      expect(response.status).toBe(404);
    });
  });

  describe('GET /admin/farms/:id', () => {
    it('should get farm detail successfully', async () => {
      const farmId = '1';
      const mockFarmDetail = {
        farm: { _id: farmId, name: 'Test Farm' },
        owner: { _id: 'owner1', fullName: 'Owner 1' },
        farmers: [],
        experts: [],
        gardens: []
      };

      farmService.getDetail.mockResolvedValue(mockFarmDetail);

      const response = await request(app)
        .get(`/admin/farms/${farmId}`)
        .set(getAuthHeaders(adminToken));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Category found successfully');
      expect(response.body.data).toEqual(mockFarmDetail);
      expect(farmService.getDetail).toHaveBeenCalledWith(farmId);
    });

    it('should fail when farm not found', async () => {
      const farmId = '1';

      farmService.getDetail.mockResolvedValue(null);

      const response = await request(app)
        .get(`/admin/farms/${farmId}`)
        .set(getAuthHeaders(adminToken));

      expect(response.status).toBe(404);
    });
  });
}); 