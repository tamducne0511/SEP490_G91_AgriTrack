jest.mock('../../../models/equipmentCategories.model');
jest.mock('../../../models/equipment.model');
jest.mock('../../../models/farm.model');

const equipmentCategoryService = require('../../../services/equipmentCategory.service');
const EquipmentCategory = require('../../../models/equipmentCategories.model');
const Equipment = require('../../../models/equipment.model');
const Farm = require('../../../models/farm.model');
const NotFoundException = require('../../../middlewares/exceptions/notfound');

describe('Equipment Category Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getListPagination', () => {
    it('should return paginated equipment category list with farm and keyword filter', async () => {
      const farmId = '507f1f77bcf86cd799439011';
      const page = 1;
      const keyword = 'tractor';
      const mockCategories = [{ _id: 'cat1', name: 'Tractor' }];

      EquipmentCategory.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockCategories),
        }),
      });

      const result = await equipmentCategoryService.getListPagination(farmId, page, keyword);

      expect(EquipmentCategory.find).toHaveBeenCalledWith({ farmId, name: { $regex: keyword, $options: 'i' } });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getTotal', () => {
    it('should return total count with farm and keyword filter', async () => {
      const farmId = '507f1f77bcf86cd799439011';
      const keyword = 'tractor';
      EquipmentCategory.countDocuments.mockResolvedValue(3);

      const result = await equipmentCategoryService.getTotal(farmId, keyword);

      expect(EquipmentCategory.countDocuments).toHaveBeenCalledWith({ farmId, name: { $regex: keyword, $options: 'i' } });
      expect(result).toBe(3);
    });
  });

  describe('create', () => {
    it('should validate farm and create category', async () => {
      const data = { farmId: '507f1f77bcf86cd799439011', name: 'New', description: 'desc' };
      Farm.findById.mockResolvedValue({ _id: data.farmId });
      const mockCat = { _id: 'cat1', ...data, save: jest.fn().mockResolvedValue(true) };
      EquipmentCategory.mockImplementation(() => mockCat);

      const result = await equipmentCategoryService.create(data);

      expect(Farm.findById).toHaveBeenCalledWith(data.farmId);
      expect(EquipmentCategory).toHaveBeenCalled();
      expect(mockCat.save).toHaveBeenCalled();
      expect(result).toEqual(mockCat);
    });

    it('should throw when farm not found', async () => {
      const data = { farmId: 'x', name: 'New' };
      Farm.findById.mockResolvedValue(null);
      await expect(equipmentCategoryService.create(data)).rejects.toThrow(NotFoundException);
    });
  });

  describe('find', () => {
    it('should return by id', async () => {
      const id = '507f1f77bcf86cd799439011';
      const doc = { _id: id };
      EquipmentCategory.findById.mockResolvedValue(doc);
      const result = await equipmentCategoryService.find(id);
      expect(EquipmentCategory.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(doc);
    });

    it('should return null on error', async () => {
      const id = 'bad';
      EquipmentCategory.findById.mockImplementation(() => { throw new Error('db'); });
      const result = await equipmentCategoryService.find(id);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should validate existing and save', async () => {
      const id = '507f1f77bcf86cd799439011';
      const data = { name: 'Updated Category' };
      const mockCategory = { 
        _id: id, 
        name: 'Old Category',
        save: jest.fn().mockImplementation(function() {
          // Return the category object itself (as Mongoose does)
          return Promise.resolve(this);
        })
      };

      EquipmentCategory.findById.mockResolvedValue(mockCategory);

      const result = await equipmentCategoryService.update(id, data);

      expect(EquipmentCategory.findById).toHaveBeenCalledWith(id);
      expect(mockCategory.save).toHaveBeenCalled();
      expect(result).toEqual(mockCategory);
    });

    it('should throw when not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      const data = { name: 'Updated Category' };

      EquipmentCategory.findById.mockResolvedValue(null);

      await expect(equipmentCategoryService.update(id, data)).rejects.toThrow('Not found EquipmentCategory with id: ' + id);
    });
  });

  describe('remove', () => {
    it('should set status false', async () => {
      EquipmentCategory.updateOne.mockResolvedValue({ acknowledged: true });
      const result = await equipmentCategoryService.remove('507f1f77bcf86cd799439011');
      expect(EquipmentCategory.updateOne).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' }, { status: false });
      expect(result).toEqual({ acknowledged: true });
    });
  });
});
