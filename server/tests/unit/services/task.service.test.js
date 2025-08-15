jest.mock('../../../models/task.model');
jest.mock('../../../models/farm.model');
jest.mock('../../../models/garden.model');
jest.mock('../../../models/user.model');
jest.mock('../../../models/taskHistory.model');
jest.mock('../../../models/taskDailyNote.model');

const taskService = require('../../../services/task.service');
const Task = require('../../../models/task.model');
const Farm = require('../../../models/farm.model');
const Garden = require('../../../models/garden.model');
const User = require('../../../models/user.model');
const TaskHistory = require('../../../models/taskHistory.model');
const TaskDailyNote = require('../../../models/taskDailyNote.model');
const NotFoundException = require('../../../middlewares/exceptions/notfound');
const BadRequestException = require('../../../middlewares/exceptions/badrequest');

describe('Task Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getListPagination', () => {
    it('should return paginated task list with farm and garden filters', async () => {
      // Arrange
      const farmId = '507f1f77bcf86cd799439011';
      const gardenId = '507f1f77bcf86cd799439012';
      const page = 1;
      const keyword = 'care';
      const mockTasks = [{ _id: 't1', name: 'care tree' }];

      Task.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockTasks),
        }),
      });

      // Act
      const result = await taskService.getListPagination(farmId, gardenId, page, keyword);

      // Assert
      expect(Task.find).toHaveBeenCalledWith({ farmId, name: { $regex: keyword, $options: 'i' }, gardenId });
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getTotal', () => {
    it('should return total count with filters', async () => {
      // Arrange
      const farmId = '507f1f77bcf86cd799439011';
      const gardenId = '507f1f77bcf86cd799439012';
      const keyword = 'care';

      Task.countDocuments.mockResolvedValue(3);

      // Act
      const result = await taskService.getTotal(farmId, gardenId, keyword);

      // Assert
      expect(Task.countDocuments).toHaveBeenCalledWith({ farmId, name: { $regex: keyword, $options: 'i' }, gardenId });
      expect(result).toBe(3);
    });
  });

  describe('create', () => {
    it('should validate farm and garden, then create task', async () => {
      // Arrange
      const data = { farmId: '507f1f77bcf86cd799439011', gardenId: '507f1f77bcf86cd799439012', name: 'task' };
      Farm.findById.mockResolvedValue({ _id: data.farmId });
      Garden.findById.mockResolvedValue({ _id: data.gardenId });
      const mockTask = { _id: 't1', ...data, save: jest.fn().mockResolvedValue(true) };
      Task.mockImplementation(() => mockTask);

      // Act
      const result = await taskService.create(data);

      // Assert
      expect(Farm.findById).toHaveBeenCalledWith(data.farmId);
      expect(Garden.findById).toHaveBeenCalledWith(data.gardenId);
      expect(Task).toHaveBeenCalled();
      expect(mockTask.save).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });

    it('should throw when farm not found', async () => {
      const data = { farmId: 'x', gardenId: 'y' };
      Farm.findById.mockResolvedValue(null);
      await expect(taskService.create(data)).rejects.toThrow(NotFoundException);
    });

    it('should throw when garden not found', async () => {
      const data = { farmId: '507f1f77bcf86cd799439011', gardenId: 'y' };
      Farm.findById.mockResolvedValue({ _id: data.farmId });
      Garden.findById.mockResolvedValue(null);
      await expect(taskService.create(data)).rejects.toThrow(NotFoundException);
    });
  });

  describe('find', () => {
    it('should return task with populated farmer', async () => {
      const taskId = '507f1f77bcf86cd799439011';
      const mockTask = { _id: taskId };
      Task.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockTask) });
      const result = await taskService.find(taskId);
      expect(Task.findById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(mockTask);
    });

    it('should return null on error', async () => {
      const taskId = 'bad';
      Task.findById.mockImplementation(() => { throw new Error('db'); });
      const result = await taskService.find(taskId);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should validate task and garden, then update and save', async () => {
      const id = '507f1f77bcf86cd799439011';
      const data = { name: 'Updated Task', gardenId: '507f1f77bcf86cd799439012' };
      const expectedResult = { _id: id, ...data };
      
      // Create a mock task that will be returned by find()
      const mockTask = { 
        _id: id, 
        name: 'Old Task',
        save: jest.fn().mockImplementation(function() {
          // Return the task object itself (as Mongoose does)
          return Promise.resolve(this);
        })
      };
      
      const mockGarden = { _id: data.gardenId, name: 'Garden' };

      // Mock the internal find() call in update()
      Task.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTask)
      });
      Garden.findById.mockResolvedValue(mockGarden);

      const result = await taskService.update(id, data);

      expect(Task.findById).toHaveBeenCalledWith(id);
      expect(Garden.findById).toHaveBeenCalledWith(data.gardenId);
      expect(mockTask.save).toHaveBeenCalled();
      // The service modifies the task object and returns it, so we expect the modified task
      expect(result).toEqual(mockTask);
    });

    it('should throw when task not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      const data = { name: 'Updated Task' };

      Task.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await expect(taskService.update(id, data)).rejects.toThrow('Not found task with id: ' + id);
    });

    it('should throw when garden not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      const data = { gardenId: 'y' };
      const mockTask = { _id: id, name: 'Task' };

      // Mock task as found but garden as not found
      Task.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTask)
      });
      Garden.findById.mockResolvedValue(null);

      await expect(taskService.update(id, data)).rejects.toThrow('Not found Garden with id: y');
    });
  });

  describe('remove', () => {
    it('should update status to false', async () => {
      Task.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });
      const result = await taskService.remove('507f1f77bcf86cd799439011');
      expect(Task.updateOne).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' }, { status: false });
      expect(result).toEqual({ acknowledged: true, modifiedCount: 1 });
    });
  });

  describe('assignFarmer', () => {
    it('should assign farmer and create history', async () => {
      const taskId = 't1';
      const farmerId = 'u1';
      const mockTask = { _id: taskId, save: jest.fn().mockResolvedValue(true) };
      Task.findById.mockResolvedValue(mockTask);
      User.findById.mockResolvedValue({ _id: farmerId, role: 'farmer' });
      const history = { save: jest.fn().mockResolvedValue(true) };
      TaskHistory.mockImplementation(() => history);

      const result = await taskService.assignFarmer(taskId, farmerId);

      expect(Task.findById).toHaveBeenCalledWith(taskId);
      expect(User.findById).toHaveBeenCalledWith(farmerId);
      expect(mockTask.save).toHaveBeenCalled();
      expect(history.save).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });

    it('should throw when task not found', async () => {
      Task.findById.mockResolvedValue(null);
      await expect(taskService.assignFarmer('t', 'u')).rejects.toThrow('Not found task with id: t');
    });

    it('should throw when already assigned', async () => {
      Task.findById.mockResolvedValue({ _id: 't', farmerId: 'u' });
      await expect(taskService.assignFarmer('t', 'x')).rejects.toThrow('This task has already been assigned to a farmer.');
    });

    it('should throw when user is not farmer', async () => {
      Task.findById.mockResolvedValue({ _id: 't' });
      User.findById.mockResolvedValue({ _id: 'x', role: 'expert' });
      await expect(taskService.assignFarmer('t', 'x')).rejects.toThrow('Not found user with id: x');
    });
  });

  describe('changeStatusAssigned', () => {
    it('should change status and create history', async () => {
      const task = { _id: 't', save: jest.fn().mockResolvedValue(true) };
      Task.findOne.mockResolvedValue(task);
      const history = { save: jest.fn().mockResolvedValue(true) };
      TaskHistory.mockImplementation(() => history);

      const result = await taskService.changeStatusAssigned('t', 'u', 'in_progress');
      expect(Task.findOne).toHaveBeenCalledWith({ _id: 't', farmerId: 'u' });
      expect(task.save).toHaveBeenCalled();
      expect(history.save).toHaveBeenCalled();
      expect(result).toEqual(task);
    });

    it('should throw when task not found', async () => {
      Task.findOne.mockResolvedValue(null);
      await expect(taskService.changeStatusAssigned('t', 'u', 'done')).rejects.toThrow('Not found task with id: t');
    });
  });
});
