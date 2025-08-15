const treeService = require('../../../services/tree.service');
const Tree = require('../../../models/tree.model');
const Garden = require('../../../models/garden.model');
const Farm = require('../../../models/farm.model');
const NotFoundException = require('../../../middlewares/exceptions/notfound');
const BadRequestException = require('../../../middlewares/exceptions/badrequest');

// Mock the models
jest.mock('../../../models/tree.model');
jest.mock('../../../models/garden.model');
jest.mock('../../../models/farm.model');

describe('Tree Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTree', () => {
    it('should throw when garden not found', async () => {
      Garden.findById = jest.fn().mockReturnValue(null);
      await expect(treeService.generateTree('g1', 2, 2)).rejects.toThrow(NotFoundException);
    });

    it('should throw when trees already exist for garden', async () => {
      Garden.findById = jest.fn().mockReturnValue({ _id: 'g1' });
      Tree.countDocuments = jest.fn().mockResolvedValue(1);
      await expect(treeService.generateTree('g1', 2, 2)).rejects.toThrow('Tree already exists for this garden');
    });

    it('should create grid of trees when none exist', async () => {
      Garden.findById = jest.fn().mockReturnValue({ _id: 'g1' });
      Tree.countDocuments = jest.fn().mockResolvedValue(0);
      const saves = [];
      Tree.mockImplementation(() => ({ save: jest.fn().mockImplementation(() => saves.push(1)) }));

      await treeService.generateTree('g1', 2, 2);

      expect(Tree.countDocuments).toHaveBeenCalledWith({ gardenId: 'g1' });
      // 2x2 grid => 4 saves
      expect(saves.length).toBe(4);
    });
  });

  describe('getDetail', () => {
    it('should return tree with garden and farm', async () => {
      const id = '507f1f77bcf86cd799439011';
      const tree = { _id: id, gardenId: 'g1' };
      const garden = { _id: 'g1', farmId: 'f1' };
      const farm = { _id: 'f1' };

      Tree.findById = jest.fn().mockResolvedValue(tree);
      Garden.findById = jest.fn().mockResolvedValue(garden);
      Farm.findById = jest.fn().mockResolvedValue(farm);

      const result = await treeService.getDetail(id);

      expect(Tree.findById).toHaveBeenCalledWith(id);
      expect(Garden.findById).toHaveBeenCalledWith(tree.gardenId);
      expect(Farm.findById).toHaveBeenCalledWith(garden.farmId);
      expect(result).toEqual({ detail: tree, garden, farm });
    });

    it('should throw when tree not found', async () => {
      Tree.findById = jest.fn().mockResolvedValue(null);
      await expect(treeService.getDetail('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getList', () => {
    it('should aggregate list for garden', async () => {
      const gardenId = '507f1f77bcf86cd799439011';
      const docs = [{ _id: 't1' }, { _id: 't2' }];
      Tree.aggregate.mockResolvedValue(docs);
      const result = await treeService.getList(gardenId);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(docs);
    });
  });
});
