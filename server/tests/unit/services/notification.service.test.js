jest.mock('../../../models/notification.model');
jest.mock('../../../models/farm.model');

const notificationService = require('../../../services/notification.service');
const Notification = require('../../../models/notification.model');
const Farm = require('../../../models/farm.model');

describe('Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getListPagination', () => {
    it('should return paginated notifications filtered by farm and keyword', async () => {
      const farmId = '507f1f77bcf86cd799439011';
      const page = 1;
      const keyword = 'alert';
      const list = [{ _id: 'n1', title: 'alert 1' }];

      Notification.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(list),
        }),
      });

      const result = await notificationService.getListPagination(farmId, page, keyword);

      expect(Notification.find).toHaveBeenCalledWith({ farmId, title: { $regex: keyword, $options: 'i' } });
      expect(result).toEqual(list);
    });
  });

  describe('getTotal', () => {
    it('should return total filtered by farm and keyword', async () => {
      const farmId = '507f1f77bcf86cd799439011';
      const keyword = 'alert';
      Notification.countDocuments.mockResolvedValue(4);

      const result = await notificationService.getTotal(farmId, keyword);

      expect(Notification.countDocuments).toHaveBeenCalledWith({ farmId, title: { $regex: keyword, $options: 'i' } });
      expect(result).toBe(4);
    });
  });

  describe('create', () => {
    it('should validate farm and create notification', async () => {
      const data = { farmId: '507f1f77bcf86cd799439011', title: 't', content: 'c' };
      Farm.findById.mockResolvedValue({ _id: data.farmId });
      const doc = { _id: 'n1', ...data, save: jest.fn().mockResolvedValue(true) };
      Notification.mockImplementation(() => doc);

      const result = await notificationService.create(data);

      expect(Farm.findById).toHaveBeenCalledWith(data.farmId);
      expect(Notification).toHaveBeenCalled();
      expect(doc.save).toHaveBeenCalled();
      expect(result).toEqual(doc);
    });

    it('should throw when farm not found', async () => {
      const data = { farmId: 'x', title: 't' };
      Farm.findById.mockResolvedValue(null);
      await expect(notificationService.create(data)).rejects.toThrow('Not found Farm with id: x');
    });
  });

  describe('find', () => {
    it('should return by id', async () => {
      const id = '507f1f77bcf86cd799439011';
      const doc = { _id: id };
      Notification.findById.mockResolvedValue(doc);
      const result = await notificationService.find(id);
      expect(Notification.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(doc);
    });

    it('should return null on error', async () => {
      const id = 'bad';
      Notification.findById.mockImplementation(() => { throw new Error('db'); });
      const result = await notificationService.find(id);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should validate existing and save', async () => {
      const id = '507f1f77bcf86cd799439011';
      const data = { title: 'Updated Notification' };
      const mockNotification = { 
        _id: id, 
        title: 'Old Notification',
        save: jest.fn().mockImplementation(function() {
          // Return the notification object itself (as Mongoose does)
          return Promise.resolve(this);
        })
      };

      Notification.findById.mockResolvedValue(mockNotification);

      const result = await notificationService.update(id, data);

      expect(Notification.findById).toHaveBeenCalledWith(id);
      expect(mockNotification.save).toHaveBeenCalled();
      expect(result).toEqual(mockNotification);
    });

    it('should throw when not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      const data = { title: 'Updated Notification' };

      Notification.findById.mockResolvedValue(null);

      await expect(notificationService.update(id, data)).rejects.toThrow('Not found Notification with id: ' + id);
    });
  });

  describe('remove', () => {
    it('should set status false', async () => {
      Notification.updateOne.mockResolvedValue({ acknowledged: true });
      const result = await notificationService.remove('507f1f77bcf86cd799439011');
      expect(Notification.updateOne).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' }, { status: false });
      expect(result).toEqual({ acknowledged: true });
    });
  });

  describe('markRead', () => {
    it('should add user to readBy set', async () => {
      Notification.findByIdAndUpdate.mockResolvedValue({});
      await notificationService.markRead('507f1f77bcf86cd799439012', '507f1f77bcf86cd799439011');
      expect(Notification.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
        { $addToSet: { readBy: '507f1f77bcf86cd799439011' } },
        { new: true }
      );
    });
  });

  describe('getTotalUnread', () => {
    it('should count unread by farm', async () => {
      Notification.countDocuments.mockResolvedValue(2);
      const result = await notificationService.getTotalUnread('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012');
      expect(Notification.countDocuments).toHaveBeenCalledWith({ farmId: '507f1f77bcf86cd799439012', readBy: { $ne: '507f1f77bcf86cd799439011' } });
      expect(result).toBe(2);
    });
  });
});
