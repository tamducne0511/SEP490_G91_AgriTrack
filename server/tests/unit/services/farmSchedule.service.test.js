const farmScheduleService = require('../../../services/farmSchedule.service');
const FarmSchedule = require('../../../models/farmSchedule.model');
const Farm = require('../../../models/farm.model');

// Mock the models
jest.mock('../../../models/farmSchedule.model');
jest.mock('../../../models/farm.model');

describe('Farm Schedule Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getListPagination', () => {
    it('should return paginated schedules filtered by farm and keyword', async () => {
      const farmId = '507f1f77bcf86cd799439011';
      const page = 1;
      const keyword = 'care';
      const list = [{ _id: 's1', title: 'care' }];

      FarmSchedule.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(list),
            }),
          }),
        }),
      });

      const result = await farmScheduleService.getListPagination(farmId, page, keyword);

      expect(FarmSchedule.find).toHaveBeenCalledWith({ farmId, title: { $regex: keyword, $options: 'i' } });
      expect(result).toEqual(list);
    });
  });

  describe('getTotal', () => {
    it('should return total filtered by farm and keyword', async () => {
      const farmId = '507f1f77bcf86cd799439011';
      const keyword = 'care';
      FarmSchedule.countDocuments.mockResolvedValue(3);

      const result = await farmScheduleService.getTotal(farmId, keyword);

      expect(FarmSchedule.countDocuments).toHaveBeenCalledWith({ farmId, title: { $regex: keyword, $options: 'i' } });
      expect(result).toBe(3);
    });
  });

  describe('create', () => {
    it('should validate farm and create schedule with createdBy', async () => {
      const userId = '507f1f77bcf86cd799439010';
      const data = { farmId: '507f1f77bcf86cd799439011', title: 't', description: 'd' };
      Farm.findById.mockResolvedValue({ _id: data.farmId });
      const doc = { _id: 's1', ...data, save: jest.fn().mockResolvedValue(true) };
      FarmSchedule.mockImplementation(() => doc);

      const result = await farmScheduleService.create(userId, data);

      expect(Farm.findById).toHaveBeenCalledWith(data.farmId);
      expect(FarmSchedule).toHaveBeenCalled();
      expect(doc.save).toHaveBeenCalled();
      expect(result).toEqual(doc);
    });

    it('should throw when farm not found', async () => {
      const userId = '507f1f77bcf86cd799439010';
      const data = { farmId: 'x', title: 't' };
      Farm.findById.mockResolvedValue(null);
      await expect(farmScheduleService.create(userId, data)).rejects.toThrow('Not found Farm with id: x');
    });
  });

  describe('find', () => {
    it('should return by id', async () => {
      const id = '507f1f77bcf86cd799439011';
      const doc = { _id: id };
      FarmSchedule.findById.mockResolvedValue(doc);
      const result = await farmScheduleService.find(id);
      expect(FarmSchedule.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(doc);
    });

    it('should return null on error', async () => {
      const id = 'bad';
      FarmSchedule.findById.mockImplementation(() => { throw new Error('db'); });
      const result = await farmScheduleService.find(id);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should validate existing and save', async () => {
      const id = '507f1f77bcf86cd799439011';
      const data = { title: 'Updated Schedule' };
      const mockSchedule = { 
        _id: id, 
        title: 'Old Schedule',
        save: jest.fn().mockImplementation(function() {
          // Return the schedule object itself (as Mongoose does)
          return Promise.resolve(this);
        })
      };

      FarmSchedule.findById.mockResolvedValue(mockSchedule);

      const result = await farmScheduleService.update(id, data);

      expect(FarmSchedule.findById).toHaveBeenCalledWith(id);
      expect(mockSchedule.save).toHaveBeenCalled();
      expect(result).toEqual(mockSchedule);
    });

    it('should throw when not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      const data = { title: 'Updated Schedule' };

      FarmSchedule.findById.mockResolvedValue(null);

      await expect(farmScheduleService.update(id, data)).rejects.toThrow('Not found farm schedule with id: ' + id);
    });
  });

  describe('remove', () => {
    it('should set status false', async () => {
      FarmSchedule.updateOne.mockResolvedValue({ acknowledged: true });
      const result = await farmScheduleService.remove('507f1f77bcf86cd799439011');
      expect(FarmSchedule.updateOne).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' }, { status: false });
      expect(result).toEqual({ acknowledged: true });
    });
  });
});
