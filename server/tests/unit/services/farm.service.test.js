const farmService = require('../../../services/farm.service');
const Farm = require('../../../models/farm.model');
const User = require('../../../models/user.model');
const Garden = require('../../../models/garden.model');

jest.mock('../../../models/farm.model');
jest.mock('../../../models/garden.model');
jest.mock('../../../models/user.model');

describe('Farm Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getListPagination', () => {
    it('should return paginated farms filtered by keyword', async () => {
      const page = 1;
      const keyword = 'org';
      const list = [{ _id: 'f1', name: 'org' }];

      Farm.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(list),
        }),
      });

      const result = await farmService.getListPagination(page, keyword);

      expect(Farm.find).toHaveBeenCalledWith({ name: { $regex: keyword, $options: 'i' } });
      expect(result).toEqual(list);
    });
  });

  describe('getTotal', () => {
    it('should return total filtered by keyword', async () => {
      const keyword = 'org';
      Farm.countDocuments.mockResolvedValue(2);

      const result = await farmService.getTotal(keyword);

      expect(Farm.countDocuments).toHaveBeenCalledWith({ name: { $regex: keyword, $options: 'i' } });
      expect(result).toBe(2);
    });
  });

  describe('create', () => {
    it('should create and save a farm', async () => {
      const data = { name: 'farm', address: 'addr', description: 'd' };
      const doc = { _id: 'f1', ...data, save: jest.fn().mockResolvedValue(true) };
      Farm.mockImplementation(() => doc);

      const result = await farmService.create(data);

      expect(Farm).toHaveBeenCalled();
      expect(doc.save).toHaveBeenCalled();
      expect(result).toEqual(doc);
    });
  });

  describe('find', () => {
    it('should return by id', async () => {
      const id = '507f1f77bcf86cd799439011';
      const doc = { _id: id };
      Farm.findById.mockResolvedValue(doc);
      const result = await farmService.find(id);
      expect(Farm.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(doc);
    });

    it('should return null on error', async () => {
      Farm.findById.mockImplementation(() => { throw new Error('db'); });
      const result = await farmService.find('bad');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should validate existing and save', async () => {
      const id = '507f1f77bcf86cd799439011';
      const payload = { name: 'n', address: 'a', image: 'i.png', description: 'd' };
      const doc = { _id: id, save: jest.fn().mockResolvedValue(true) };
      Farm.findById = jest.fn().mockResolvedValue(doc);

      const result = await farmService.update(id, payload);

      expect(Farm.findById).toHaveBeenCalledWith(id);
      expect(doc.save).toHaveBeenCalled();
      expect(result).toEqual(doc);
    });

    it('should throw when not found', async () => {
      Farm.findById = jest.fn().mockResolvedValue(null);
      await expect(farmService.update('x', {})).rejects.toThrow('Not found farm with id: x');
    });
  });

  describe('remove', () => {
    it('should set status false', async () => {
      Farm.updateOne.mockResolvedValue({ acknowledged: true });
      const result = await farmService.remove('507f1f77bcf86cd799439011');
      expect(Farm.updateOne).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' }, { status: false });
      expect(result).toEqual({ acknowledged: true });
    });
  });
});
