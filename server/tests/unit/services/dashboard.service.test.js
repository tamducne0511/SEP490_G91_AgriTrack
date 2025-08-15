const Farm = require("../../../models/farm.model");
const Equipment = require("../../../models/equipment.model");
const EquipmentCategory = require("../../../models/equipmentCategories.model");
const Garden = require("../../../models/garden.model");
const Task = require("../../../models/task.model");
const User = require("../../../models/user.model");
const TaskDailyNote = require("../../../models/taskDailyNote.model");
const TaskDailyNoteEquipment = require("../../../models/taskDailyNoteEquipment.model");
const dashboardService = require("../../../services/dashboard.service");
const { USER_ROLE, TASK_TYPE } = require("../../../constants/app");

// Mock all models
jest.mock("../../../models/farm.model");
jest.mock("../../../models/equipment.model");
jest.mock("../../../models/equipmentCategories.model");
jest.mock("../../../models/garden.model");
jest.mock("../../../models/task.model");
jest.mock("../../../models/user.model");
jest.mock("../../../models/taskDailyNote.model");
jest.mock("../../../models/taskDailyNoteEquipment.model");

describe("Dashboard Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSummary", () => {
    it("should return overall statistics for all data", async () => {
      // Arrange
      const mockSummary = {
        totalFarm: 5,
        totalEquipment: 20,
        totalEquipmentCategory: 8,
        totalGarden: 15,
        totalTask: 50,
        totalFarmAdmin: 3,
        totalFarmer: 12,
        totalExpert: 2,
        totalCareTask: 30,
        totalCollectTask: 20,
      };

      Farm.countDocuments.mockResolvedValue(mockSummary.totalFarm);
      Equipment.countDocuments.mockResolvedValue(mockSummary.totalEquipment);
      EquipmentCategory.countDocuments.mockResolvedValue(mockSummary.totalEquipmentCategory);
      Garden.countDocuments.mockResolvedValue(mockSummary.totalGarden);
      Task.countDocuments
        .mockResolvedValueOnce(mockSummary.totalTask)
        .mockResolvedValueOnce(mockSummary.totalCareTask)
        .mockResolvedValueOnce(mockSummary.totalCollectTask);
      User.countDocuments
        .mockResolvedValueOnce(mockSummary.totalFarmAdmin)
        .mockResolvedValueOnce(mockSummary.totalFarmer)
        .mockResolvedValueOnce(mockSummary.totalExpert);

      // Act
      const result = await dashboardService.getSummary();

      // Assert
      expect(Farm.countDocuments).toHaveBeenCalledWith();
      expect(Equipment.countDocuments).toHaveBeenCalledWith();
      expect(EquipmentCategory.countDocuments).toHaveBeenCalledWith();
      expect(Garden.countDocuments).toHaveBeenCalledWith();
      expect(Task.countDocuments).toHaveBeenCalledWith();
      expect(Task.countDocuments).toHaveBeenCalledWith({ type: TASK_TYPE.taskCare });
      expect(Task.countDocuments).toHaveBeenCalledWith({ type: TASK_TYPE.collect });
      expect(User.countDocuments).toHaveBeenCalledWith({ role: USER_ROLE.farmAdmin });
      expect(User.countDocuments).toHaveBeenCalledWith({ role: USER_ROLE.farmer });
      expect(User.countDocuments).toHaveBeenCalledWith({ role: USER_ROLE.expert });
      expect(result).toEqual(mockSummary);
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      const error = new Error("Database connection failed");

      Farm.countDocuments.mockRejectedValue(error);

      // Act & Assert
      await expect(dashboardService.getSummary()).rejects.toThrow(error);
    });
  });

  describe("getHarvest", () => {
    it("should return harvest data with farm filter", async () => {
      // Arrange
      const farmId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const fromDate = "2024-01-01";
      const toDate = "2024-12-31";
      const mockResult = [{ _id: null, totalQuantity: 150 }];

      TaskDailyNote.aggregate.mockResolvedValue(mockResult);

      // Act
      const result = await dashboardService.getHarvest(farmId, fromDate, toDate);

      // Assert
      expect(TaskDailyNote.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $lookup: {
              from: "tasks",
              localField: "taskId",
              foreignField: "_id",
              as: "task",
            },
          }),
          expect.objectContaining({
            $match: expect.objectContaining({
              type: "harvest",
              "task.farmId": expect.any(Object),
              createdAt: expect.objectContaining({
                $gte: new Date(fromDate),
                $lte: new Date(toDate),
              }),
            }),
          }),
        ])
      );
      expect(result).toEqual({ totalQuantity: 150 });
    });

    it("should return zero quantity when no harvest data found", async () => {
      // Arrange
      TaskDailyNote.aggregate.mockResolvedValue([]);

      // Act
      const result = await dashboardService.getHarvest();

      // Assert
      expect(result).toEqual({ totalQuantity: 0 });
    });
  });

  describe("getConsumption", () => {
    it("should return consumption data with farm filter", async () => {
      // Arrange
      const farmId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const fromDate = "2024-01-01";
      const toDate = "2024-12-31";
      const mockResult = [{ _id: null, totalQuantity: 75 }];

      TaskDailyNoteEquipment.aggregate.mockResolvedValue(mockResult);

      // Act
      const result = await dashboardService.getConsumption(farmId, fromDate, toDate);

      // Assert
      expect(TaskDailyNoteEquipment.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $lookup: {
              from: "taskdailynotes",
              localField: "dailyId",
              foreignField: "_id",
              as: "note",
            },
          }),
          expect.objectContaining({
            $lookup: {
              from: "tasks",
              localField: "note.taskId",
              foreignField: "_id",
              as: "task",
            },
          }),
          expect.objectContaining({
            $match: expect.objectContaining({
              "task.farmId": expect.any(Object),
              createdAt: expect.objectContaining({
                $gte: new Date(fromDate),
                $lte: new Date(toDate),
              }),
            }),
          }),
        ])
      );
      expect(result).toEqual({ totalQuantity: 75 });
    });

    it("should return zero quantity when no consumption data found", async () => {
      // Arrange
      TaskDailyNoteEquipment.aggregate.mockResolvedValue([]);

      // Act
      const result = await dashboardService.getConsumption();

      // Assert
      expect(result).toEqual({ totalQuantity: 0 });
    });

    it("should handle date filters correctly", async () => {
      // Arrange
      const fromDate = "2024-01-01";
      TaskDailyNoteEquipment.aggregate.mockResolvedValue([]);

      // Act
      await dashboardService.getConsumption(null, fromDate);

      // Assert
      expect(TaskDailyNoteEquipment.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              createdAt: expect.objectContaining({
                $gte: new Date(fromDate),
              }),
            }),
          }),
        ])
      );
    });
  });
});
