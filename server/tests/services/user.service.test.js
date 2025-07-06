const userService = require('../../services/user.service');
const User = require('../../models/user.model');
const Farm = require('../../models/farm.model');
const Task = require('../../models/task.model');
const { createTestUser, createObjectId } = require('../utils/testUtils');
const BadRequestException = require('../../middlewares/exceptions/badrequest');

// Mock the models
jest.mock('../../models/user.model');
jest.mock('../../models/farm.model');
jest.mock('../../models/task.model');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getListPagination', () => {
    it('should return paginated user list', async () => {
      const mockUsers = [
        { _id: '1', fullName: 'User 1', email: 'user1@test.com' },
        { _id: '2', fullName: 'User 2', email: 'user2@test.com' }
      ];

      User.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockUsers)
          })
        })
      });

      const result = await userService.getListPagination('farmer', 1, 'User');

      expect(User.find).toHaveBeenCalledWith({
        role: 'farmer',
        fullName: { $regex: 'User', $options: 'i' }
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getListFarmerInFarm', () => {
    it('should return paginated farmer list in farm', async () => {
      const mockFarmers = [
        { _id: '1', fullName: 'Farmer 1', farmId: 'farm1' },
        { _id: '2', fullName: 'Farmer 2', farmId: 'farm1' }
      ];

      User.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockFarmers)
          })
        })
      });

      const farmId = createObjectId();
      const result = await userService.getListFarmerInFarm(farmId, 1, 'Farmer');

      expect(User.find).toHaveBeenCalledWith({
        farmId: expect.any(Object),
        role: 'farmer',
        fullName: { $regex: 'Farmer', $options: 'i' }
      });
      expect(result).toEqual(mockFarmers);
    });
  });

  describe('getTotal', () => {
    it('should return total count of users', async () => {
      User.countDocuments.mockResolvedValue(10);

      const result = await userService.getTotal('farmer', 'User');

      expect(User.countDocuments).toHaveBeenCalledWith({
        role: 'farmer',
        fullName: { $regex: 'User', $options: 'i' }
      });
      expect(result).toBe(10);
    });
  });

  describe('getTotalFarmerInFarm', () => {
    it('should return total count of farmers in farm', async () => {
      User.countDocuments.mockResolvedValue(5);

      const farmId = createObjectId();
      const result = await userService.getTotalFarmerInFarm(farmId, 'Farmer');

      expect(User.countDocuments).toHaveBeenCalledWith({
        farmId: expect.any(Object),
        role: 'farmer',
        fullName: { $regex: 'Farmer', $options: 'i' }
      });
      expect(result).toBe(5);
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'newuser@test.com',
        fullName: 'New User',
        password: 'password123'
      };

      User.find.mockResolvedValue([]);
      const mockUser = { ...userData, _id: '1', save: jest.fn().mockResolvedValue(true) };
      User.mockImplementation(() => mockUser);

      const result = await userService.create(userData);

      expect(User.find).toHaveBeenCalledWith({ email: userData.email });
      expect(User).toHaveBeenCalledWith(userData);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@test.com',
        fullName: 'Existing User'
      };

      User.find.mockResolvedValue([{ email: 'existing@test.com' }]);

      await expect(userService.create(userData)).rejects.toThrow(BadRequestException);
      expect(User.find).toHaveBeenCalledWith({ email: userData.email });
    });
  });

  describe('assignFarmToUser', () => {
    it('should assign farm to farm admin successfully', async () => {
      const mockUser = {
        _id: '1',
        role: 'farm-admin',
        farmId: null,
        save: jest.fn().mockResolvedValue(true)
      };
      const mockFarm = { _id: 'farm1', name: 'Test Farm' };

      User.findById.mockResolvedValue(mockUser);
      Farm.findById.mockResolvedValue(mockFarm);
      User.findOne.mockResolvedValue(null);

      await userService.assignFarmToUser('1', 'farm1');

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(Farm.findById).toHaveBeenCalledWith('farm1');
      expect(User.findOne).toHaveBeenCalledWith({ farmId: 'farm1' });
      expect(mockUser.farmId).toBe('farm1');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(userService.assignFarmToUser('1', 'farm1')).rejects.toThrow(BadRequestException);
      expect(User.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error if user role is not farm admin or expert', async () => {
      const mockUser = {
        _id: '1',
        role: 'farmer',
        farmId: null
      };

      User.findById.mockResolvedValue(mockUser);

      await expect(userService.assignFarmToUser('1', 'farm1')).rejects.toThrow(BadRequestException);
    });

    it('should throw error if farm already assigned to user', async () => {
      const mockUser = {
        _id: '1',
        role: 'farm-admin',
        farmId: 'farm1'
      };

      User.findById.mockResolvedValue(mockUser);

      await expect(userService.assignFarmToUser('1', 'farm1')).rejects.toThrow(BadRequestException);
    });

    it('should throw error if farm not found', async () => {
      const mockUser = {
        _id: '1',
        role: 'farmAdmin',
        farmId: null
      };

      User.findById.mockResolvedValue(mockUser);
      Farm.findById.mockResolvedValue(null);

      await expect(userService.assignFarmToUser('1', 'farm1')).rejects.toThrow(BadRequestException);
    });

    it('should throw error if farm already assigned to another farm admin', async () => {
      const mockUser = {
        _id: '1',
        role: 'farmAdmin',
        farmId: null
      };
      const mockFarm = { _id: 'farm1', name: 'Test Farm' };

      User.findById.mockResolvedValue(mockUser);
      Farm.findById.mockResolvedValue(mockFarm);
      User.findOne.mockResolvedValue({ _id: '2', role: 'farmAdmin' });

      await expect(userService.assignFarmToUser('1', 'farm1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('find', () => {
    it('should find user by id successfully', async () => {
      const mockUser = { _id: '1', fullName: 'Test User' };
      User.findById.mockResolvedValue(mockUser);

      const result = await userService.find('1');

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      User.findById.mockRejectedValue(new Error('Not found'));

      const result = await userService.find('1');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const mockUser = {
        _id: '1',
        fullName: 'Old Name',
        phone: '1234567890',
        address: 'Old Address',
        gender: 'male',
        avatar: 'old-avatar.jpg',
        birthday: new Date('1990-01-01'),
        save: jest.fn().mockResolvedValue(true)
      };

      const updateData = {
        fullName: 'New Name',
        phone: '9876543210',
        address: 'New Address',
        gender: 'female',
        birthday: '1995-05-15',
        avatar: 'new-avatar.jpg'
      };

      User.findById.mockResolvedValue(mockUser);

      const result = await userService.update('1', updateData);

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(mockUser.fullName).toBe(updateData.fullName);
      expect(mockUser.phone).toBe(updateData.phone);
      expect(mockUser.address).toBe(updateData.address);
      expect(mockUser.gender).toBe(updateData.gender);
      expect(mockUser.avatar).toBe(updateData.avatar);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(userService.update('1', { fullName: 'New Name' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete user successfully', async () => {
      User.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await userService.remove('1');

      expect(User.updateOne).toHaveBeenCalledWith({ _id: '1' }, { status: false });
      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe('getDetail', () => {
    it('should get user detail with farm and tasks', async () => {
      const mockUser = { _id: '1', fullName: 'Test User', farmId: 'farm1' };
      const mockFarm = { _id: 'farm1', name: 'Test Farm' };
      const mockTasks = [
        { _id: 'task1', title: 'Task 1' },
        { _id: 'task2', title: 'Task 2' }
      ];

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      Farm.findById.mockResolvedValue(mockFarm);
      Task.find.mockResolvedValue(mockTasks);

      const result = await userService.getDetail('1');

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(Farm.findById).toHaveBeenCalledWith('farm1');
      expect(Task.find).toHaveBeenCalledWith({ farmerId: '1' });
      expect(result).toEqual({
        user: mockUser,
        farm: mockFarm,
        tasks: mockTasks
      });
    });

    it('should throw error if user not found', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(userService.getDetail('1')).rejects.toThrow(BadRequestException);
    });
  });
}); 