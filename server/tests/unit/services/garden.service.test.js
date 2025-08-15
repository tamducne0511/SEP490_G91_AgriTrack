jest.mock('../../../models/garden.model');
jest.mock('../../../models/farm.model');

const gardenService = require('../../../services/garden.service');
const Garden = require('../../../models/garden.model');
const Farm = require('../../../models/farm.model');

describe('Garden Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getListPagination', () => {
    it('should return paginated gardens filtered by farm and keyword', async () => {
      const farmId = '507f1f77bcf86cd799439011';
      const page = 1;
      const keyword = 'veg';
      const list = [{ _id: 'g1', name: 'veg' }];

      Garden.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(list),
        }),
      });

      const result = await gardenService.getListPagination(farmId, page, keyword);

      expect(Garden.find).toHaveBeenCalledWith({ farmId, name: { $regex: keyword, $options: 'i' } });
      expect(result).toEqual(list);
    });
  });

  describe('getTotal', () => {
    it('should return total filtered by farm and keyword', async () => {
      const farmId = '507f1f77bcf86cd799439011';
      const keyword = 'veg';
      Garden.countDocuments.mockResolvedValue(2);

      const result = await gardenService.getTotal(farmId, keyword);

      expect(Garden.countDocuments).toHaveBeenCalledWith({ farmId, name: { $regex: keyword, $options: 'i' } });
      expect(result).toBe(2);
    });
  });

  describe('create', () => {
    it('should validate farm and create garden', async () => {
      const data = { farmId: '507f1f77bcf86cd799439011', name: 'g', description: 'd' };
      Farm.findById.mockResolvedValue({ _id: data.farmId });
      const doc = { _id: 'g1', ...data, save: jest.fn().mockResolvedValue(true) };
      Garden.mockImplementation(() => doc);

      const result = await gardenService.create(data);

      expect(Farm.findById).toHaveBeenCalledWith(data.farmId);
      expect(Garden).toHaveBeenCalled();
      expect(doc.save).toHaveBeenCalled();
      expect(result).toEqual(doc);
    });

    it('should throw when farm not found', async () => {
      const data = { farmId: 'x', name: 'g' };
      Farm.findById.mockResolvedValue(null);
      await expect(gardenService.create(data)).rejects.toThrow('Not found Farm with id: x');
    });
  });

  describe('find', () => {
    it('should return by id', async () => {
      const id = '507f1f77bcf86cd799439011';
      const doc = { _id: id };
      Garden.findById.mockResolvedValue(doc);
      const result = await gardenService.find(id);
      expect(Garden.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(doc);
    });

    it('should return null on error', async () => {
      const id = 'bad';
      Garden.findById.mockImplementation(() => { throw new Error('db'); });
      const result = await gardenService.find(id);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should validate existing and save', async () => {
      const id = '507f1f77bcf86cd799439011';
      const data = { name: 'Updated Garden' };
      const mockGarden = { 
        _id: id, 
        name: 'Old Garden',
        save: jest.fn().mockImplementation(function() {
          // Return the garden object itself (as Mongoose does)
          return Promise.resolve(this);
        })
      };

      Garden.findById.mockResolvedValue(mockGarden);

      const result = await gardenService.update(id, data);

      expect(Garden.findById).toHaveBeenCalledWith(id);
      expect(mockGarden.save).toHaveBeenCalled();
      expect(result).toEqual(mockGarden);
    });

    it('should throw when not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      const data = { name: 'Updated Garden' };

      Garden.findById.mockResolvedValue(null);

      await expect(gardenService.update(id, data)).rejects.toThrow('Not found garden with id: ' + id);
    });
  });

  describe('remove', () => {
    it('should set status false', async () => {
      Garden.updateOne.mockResolvedValue({ acknowledged: true });
      const result = await gardenService.remove('507f1f77bcf86cd799439011');
      expect(Garden.updateOne).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' }, { status: false });
      expect(result).toEqual({ acknowledged: true });
    });
  });
});
