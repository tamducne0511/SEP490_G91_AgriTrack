const farmService = require('../../services/farm.service');
const Farm = require('../../models/farm.model');
const Garden = require('../../models/garden.model');
const User = require('../../models/user.model');
const NotFoundException = require('../../middlewares/exceptions/notfound');

// Mock the models
jest.mock('../../models/farm.model');
jest.mock('../../models/garden.model');
jest.mock('../../models/user.model');

describe('Farm Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getListPagination', () => {
    it('should return paginated farm list', async () => {
      const mockFarms = [
        { _id: '1', name: 'Farm 1', address: 'Address 1' },
        { _id: '2', name: 'Farm 2', address: 'Address 2' }
      ];

      Farm.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockFarms)
        })
      });

      const result = await farmService.getListPagination(1, 'Farm');

      expect(Farm.find).toHaveBeenCalledWith({
        name: { $regex: 'Farm', $options: 'i' }
      });
      expect(result).toEqual(mockFarms);
    });
  });

  describe('getTotal', () => {
    it('should return total count of farms', async () => {
      Farm.countDocuments.mockResolvedValue(5);

      const result = await farmService.getTotal('Farm');

      expect(Farm.countDocuments).toHaveBeenCalledWith({
        name: { $regex: 'Farm', $options: 'i' }
      });
      expect(result).toBe(5);
    });
  });

  describe('create', () => {
    it('should create a new farm successfully', async () => {
      const farmData = {
        name: 'New Farm',
        description: 'Test farm description',
        address: 'Test Address',
        image: '/uploads/farms/test.jpg'
      };

      const mockFarm = { ...farmData, _id: '1', save: jest.fn().mockResolvedValue(true) };
      Farm.mockImplementation(() => mockFarm);

      const result = await farmService.create(farmData);

      expect(Farm).toHaveBeenCalledWith(farmData);
      expect(mockFarm.save).toHaveBeenCalled();
      expect(result).toEqual(mockFarm);
    });
  });

  describe('find', () => {
    it('should find farm by id successfully', async () => {
      const mockFarm = { _id: '1', name: 'Test Farm' };
      Farm.findById.mockResolvedValue(mockFarm);

      const result = await farmService.find('1');

      expect(Farm.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockFarm);
    });

    it('should return null if farm not found', async () => {
      Farm.findById.mockRejectedValue(new Error('Not found'));

      const result = await farmService.find('1');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update farm successfully', async () => {
      const mockFarm = {
        _id: '1',
        name: 'Old Farm',
        description: 'Old description',
        address: 'Old Address',
        image: 'old-image.jpg',
        save: jest.fn().mockResolvedValue(true)
      };

      const updateData = {
        name: 'Updated Farm',
        description: 'Updated description',
        address: 'Updated Address',
        image: 'new-image.jpg'
      };

      Farm.findById.mockResolvedValue(mockFarm);

      const result = await farmService.update('1', updateData);

      expect(Farm.findById).toHaveBeenCalledWith('1');
      expect(mockFarm.name).toBe(updateData.name);
      expect(mockFarm.description).toBe(updateData.description);
      expect(mockFarm.address).toBe(updateData.address);
      expect(mockFarm.image).toBe(updateData.image);
      expect(mockFarm.save).toHaveBeenCalled();
      expect(result).toEqual(mockFarm);
    });

    it('should throw error if farm not found', async () => {
      Farm.findById.mockResolvedValue(null);

      await expect(farmService.update('1', { name: 'Updated Farm' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete farm successfully', async () => {
      Farm.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await farmService.remove('1');

      expect(Farm.updateOne).toHaveBeenCalledWith({ _id: '1' }, { status: false });
      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe('getDetail', () => {
    it('should get farm detail with gardens and users', async () => {
      const mockFarm = { _id: '1', name: 'Test Farm' };
      const mockOwner = { _id: 'owner1', fullName: 'Owner 1' };
      const mockFarmers = [
        { _id: 'farmer1', fullName: 'Farmer 1' },
        { _id: 'farmer2', fullName: 'Farmer 2' }
      ];
      const mockExperts = [
        { _id: 'expert1', fullName: 'Expert 1' }
      ];
      const mockGardens = [
        { _id: 'garden1', name: 'Garden 1' },
        { _id: 'garden2', name: 'Garden 2' }
      ];

      Farm.findById.mockResolvedValue(mockFarm);
      User.findOne.mockResolvedValue(mockOwner);
      User.find.mockResolvedValueOnce(mockFarmers); // First call for farmers
      User.find.mockResolvedValueOnce(mockExperts); // Second call for experts
      Garden.find.mockResolvedValue(mockGardens);

      const result = await farmService.getDetail('1');

      expect(Farm.findById).toHaveBeenCalledWith('1');
      expect(User.findOne).toHaveBeenCalledWith({ farmId: '1', role: 'farm-admin' });
      expect(User.find).toHaveBeenCalledWith({ farmId: '1', role: 'farmer' });
      expect(User.find).toHaveBeenCalledWith({ farmId: '1', role: 'expert' });
      expect(Garden.find).toHaveBeenCalledWith({ farmId: '1' });
      expect(result).toEqual({
        farm: mockFarm,
        owner: mockOwner,
        farmers: mockFarmers,
        experts: mockExperts,
        gardens: mockGardens
      });
    });

    it('should throw error if farm not found', async () => {
      Farm.findById.mockResolvedValue(null);

      await expect(farmService.getDetail('1')).rejects.toThrow(NotFoundException);
    });
  });
}); 