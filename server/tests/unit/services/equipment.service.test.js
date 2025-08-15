const equipmentService = require('../../../services/equipment.service');
const Equipment = require('../../../models/equipment.model');
const Farm = require('../../../models/farm.model');
const EquipmentCategory = require('../../../models/equipmentCategories.model');

jest.mock('../../../models/equipment.model');
jest.mock('../../../models/equipmentCategories.model');
jest.mock('../../../models/farm.model');

describe('Equipment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getListPagination', () => {
    it('should return paginated list filtered by farm, category, keyword and status', async () => {
      const farmId = '507f1f77bcf86cd799439011';
      const categoryId = '507f1f77bcf86cd799439012';
      const page = 1;
      const keyword = 'pump';
      const status = '1';
      const list = [{ _id: 'e1', name: 'pump' }];

      Equipment.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(list),
        }),
      });

      const result = await equipmentService.getListPagination(farmId, categoryId, page, keyword, status);

      expect(Equipment.find).toHaveBeenCalledWith({ farmId, name: { $regex: keyword, $options: 'i' }, categoryId, status: true });
      expect(result).toEqual(list);
    });
  });

  describe('getTotal', () => {
    it('should return total filtered by farm, category, keyword and status', async () => {
      const farmId = '507f1f77bcf86cd799439011';
      const categoryId = '507f1f77bcf86cd799439012';
      const keyword = 'pump';
      const status = '0';
      Equipment.countDocuments.mockResolvedValue(3);

      const result = await equipmentService.getTotal(farmId, categoryId, keyword, status);

      expect(Equipment.countDocuments).toHaveBeenCalledWith({ farmId, name: { $regex: keyword, $options: 'i' }, categoryId, status: false });
      expect(result).toBe(3);
    });
  });

  describe('create', () => {
    it('should validate farm and category, then create equipment', async () => {
      const data = { farmId: '507f1f77bcf86cd799439011', categoryId: '507f1f77bcf86cd799439012', name: 'pump' };
      Farm.findById.mockResolvedValue({ _id: data.farmId });
      EquipmentCategory.findById.mockResolvedValue({ _id: data.categoryId });
      const doc = { _id: 'e1', ...data, save: jest.fn().mockResolvedValue(true) };
      Equipment.mockImplementation(() => doc);

      const result = await equipmentService.create(data);

      expect(Farm.findById).toHaveBeenCalledWith(data.farmId);
      expect(EquipmentCategory.findById).toHaveBeenCalledWith(data.categoryId);
      expect(Equipment).toHaveBeenCalled();
      expect(doc.save).toHaveBeenCalled();
      expect(result).toEqual(doc);
    });

    it('should throw when farm not found', async () => {
      const data = { farmId: 'x', categoryId: '507f1f77bcf86cd799439012', name: 'pump' };
      Farm.findById.mockResolvedValue(null);
      await expect(equipmentService.create(data)).rejects.toThrow('Not found Farm with id: x');
    });

    it('should throw when category not found', async () => {
      const data = { farmId: '507f1f77bcf86cd799439011', categoryId: 'y', name: 'pump' };
      Farm.findById.mockResolvedValue({ _id: data.farmId });
      EquipmentCategory.findById.mockResolvedValue(null);
      await expect(equipmentService.create(data)).rejects.toThrow('Not found EquipmentCategory with id: y');
    });
  });

  describe('find', () => {
    it('should return by id', async () => {
      const id = '507f1f77bcf86cd799439011';
      const doc = { _id: id };
      Equipment.findById.mockResolvedValue(doc);
      const result = await equipmentService.find(id);
      expect(Equipment.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(doc);
    });

    it('should return null on error', async () => {
      const id = 'bad';
      Equipment.findById.mockImplementation(() => { throw new Error('db'); });
      const result = await equipmentService.find(id);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should validate existing and save', async () => {
      const id = '507f1f77bcf86cd799439011';
      const payload = { name: 'n', description: 'd', image: 'i.png', categoryId: '507f1f77bcf86cd799439012' };
      const doc = { _id: id, save: jest.fn().mockResolvedValue(true) };
      Equipment.findById = jest.fn().mockResolvedValue(doc);

      const result = await equipmentService.update(id, payload);

      expect(Equipment.findById).toHaveBeenCalledWith(id);
      expect(doc.save).toHaveBeenCalled();
      expect(result).toEqual(doc);
    });

    it('should throw when not found', async () => {
      Equipment.findById = jest.fn().mockResolvedValue(null);
      await expect(equipmentService.update('x', {})).rejects.toThrow('Not found Equipment with id: x');
    });
  });

  describe('remove', () => {
    it('should set status false', async () => {
      Equipment.updateOne.mockResolvedValue({ acknowledged: true });
      const result = await equipmentService.remove('507f1f77bcf86cd799439011');
      expect(Equipment.updateOne).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' }, { status: false });
      expect(result).toEqual({ acknowledged: true });
    });
  });
});
