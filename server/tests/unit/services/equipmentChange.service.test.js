const Farm = require("../../../models/farm.model");
const Equipment = require("../../../models/equipment.model");
const EquipmentChange = require("../../../models/equipmentChange.model");
const equipmentChangeService = require("../../../services/equipmentChange.service");
const NotFoundException = require("../../../middlewares/exceptions/notfound");
const BadRequestException = require("../../../middlewares/exceptions/badrequest");

// Mock all models
jest.mock("../../../models/farm.model");
jest.mock("../../../models/equipment.model");
jest.mock("../../../models/equipmentChange.model");

describe("Equipment Change Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getListPagination", () => {
    it("should return paginated equipment change list with status filter", async () => {
      // Arrange
      const farmId = "farm123";
      const status = "pending";
      const page = 1;
      const mockList = [
        { _id: "change1", type: "import", status: "pending" },
        { _id: "change2", type: "export", status: "pending" },
      ];

      EquipmentChange.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockList),
        }),
      });

      // Act
      const result = await equipmentChangeService.getListPagination(farmId, status, page);

      // Assert
      expect(EquipmentChange.find).toHaveBeenCalledWith({
        farmId: farmId,
        status: status,
      });
      expect(result).toEqual(mockList);
    });

    it("should return paginated equipment change list with 'all' status", async () => {
      // Arrange
      const farmId = "farm123";
      const status = "all";
      const page = 1;
      const mockList = [
        { _id: "change1", type: "import", status: "pending" },
        { _id: "change2", type: "export", status: "approved" },
      ];

      EquipmentChange.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockList),
        }),
      });

      // Act
      const result = await equipmentChangeService.getListPagination(farmId, status, page);

      // Assert
      expect(EquipmentChange.find).toHaveBeenCalledWith({
        farmId: farmId,
        status: { $ne: null },
      });
      expect(result).toEqual(mockList);
    });
  });

  describe("getTotal", () => {
    it("should return total count of equipment changes with status filter", async () => {
      // Arrange
      const farmId = "farm123";
      const status = "pending";
      const mockTotal = 5;

      EquipmentChange.countDocuments.mockResolvedValue(mockTotal);

      // Act
      const result = await equipmentChangeService.getTotal(farmId, status);

      // Assert
      expect(EquipmentChange.countDocuments).toHaveBeenCalledWith({
        farmId: farmId,
        status: status,
      });
      expect(result).toBe(mockTotal);
    });

    it("should return total count of equipment changes with 'all' status", async () => {
      // Arrange
      const farmId = "farm123";
      const status = "all";
      const mockTotal = 10;

      EquipmentChange.countDocuments.mockResolvedValue(mockTotal);

      // Act
      const result = await equipmentChangeService.getTotal(farmId, status);

      // Assert
      expect(EquipmentChange.countDocuments).toHaveBeenCalledWith({
        farmId: farmId,
        status: { $ne: null },
      });
      expect(result).toBe(mockTotal);
    });
  });

  describe("create", () => {
    it("should successfully create a new equipment change", async () => {
      // Arrange
      const changeData = {
        farmId: "farm123",
        equipmentId: "equipment123",
        type: "import",
        quantity: 10,
        reason: "Restocking",
      };

      const mockFarm = { _id: "farm123" };
      const mockEquipment = { _id: "equipment123", farmId: "farm123", quantity: 50 };
      const mockEquipmentChange = {
        _id: "change123",
        ...changeData,
        save: jest.fn().mockResolvedValue(true),
      };

      Farm.findById.mockResolvedValue(mockFarm);
      Equipment.findById.mockResolvedValue(mockEquipment);
      EquipmentChange.mockImplementation(() => mockEquipmentChange);

      // Act
      const result = await equipmentChangeService.create(changeData);

      // Assert
      expect(Farm.findById).toHaveBeenCalledWith(changeData.farmId);
      expect(Equipment.findById).toHaveBeenCalledWith(changeData.equipmentId);
      expect(EquipmentChange).toHaveBeenCalledWith(changeData);
      expect(mockEquipmentChange.save).toHaveBeenCalled();
      expect(result).toEqual(mockEquipmentChange);
    });

    it("should throw NotFoundException when farm not found", async () => {
      // Arrange
      const changeData = {
        farmId: "nonexistent",
        equipmentId: "equipment123",
        type: "import",
        quantity: 10,
      };

      Farm.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(equipmentChangeService.create(changeData)).rejects.toThrow(
        NotFoundException
      );
      await expect(equipmentChangeService.create(changeData)).rejects.toThrow(
        "Not found Farm with id: nonexistent"
      );
    });

    it("should throw NotFoundException when equipment not found", async () => {
      // Arrange
      const changeData = {
        farmId: "farm123",
        equipmentId: "nonexistent",
        type: "import",
        quantity: 10,
      };

      const mockFarm = { _id: "farm123" };

      Farm.findById.mockResolvedValue(mockFarm);
      Equipment.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(equipmentChangeService.create(changeData)).rejects.toThrow(
        NotFoundException
      );
      await expect(equipmentChangeService.create(changeData)).rejects.toThrow(
        "Not found Equipment with id: nonexistent"
      );
    });

    it("should throw BadRequestException when not enough equipment quantity for export", async () => {
      // Arrange
      const changeData = {
        farmId: "farm123",
        equipmentId: "equipment123",
        type: "export",
        quantity: 100,
      };

      const mockFarm = { _id: "farm123" };
      const mockEquipment = { _id: "equipment123", farmId: "farm123", quantity: 50 };

      Farm.findById.mockResolvedValue(mockFarm);
      Equipment.findById.mockResolvedValue(mockEquipment);

      // Act & Assert
      await expect(equipmentChangeService.create(changeData)).rejects.toThrow(
        BadRequestException
      );
      await expect(equipmentChangeService.create(changeData)).rejects.toThrow(
        "Not enough equipment quantity. Available: 50"
      );
    });
  });

  describe("find", () => {
    it("should return equipment change by id", async () => {
      // Arrange
      const changeId = "change123";
      const mockEquipmentChange = {
        _id: changeId,
        type: "import",
        status: "pending",
      };

      EquipmentChange.findById.mockResolvedValue(mockEquipmentChange);

      // Act
      const result = await equipmentChangeService.find(changeId);

      // Assert
      expect(EquipmentChange.findById).toHaveBeenCalledWith(changeId);
      expect(result).toEqual(mockEquipmentChange);
    });

    it("should return null when equipment change not found", async () => {
      // Arrange
      const changeId = "nonexistent";

      EquipmentChange.findById.mockResolvedValue(null);

      // Act
      const result = await equipmentChangeService.find(changeId);

      // Assert
      expect(EquipmentChange.findById).toHaveBeenCalledWith(changeId);
      expect(result).toBeNull();
    });

    it("should handle database errors and return null", async () => {
      // Arrange
      const changeId = "change123";
      const error = new Error("Database error");

      EquipmentChange.findById.mockRejectedValue(error);

      // Act
      const result = await equipmentChangeService.find(changeId);

      // Assert
      expect(EquipmentChange.findById).toHaveBeenCalledWith(changeId);
      expect(result).toBeNull();
    });
  });

  describe("approve", () => {
    it("should successfully approve equipment change", async () => {
      // Arrange
      const changeId = "change123";
      const userId = "user123";
      const mockEquipmentChange = {
        _id: changeId,
        equipmentId: "equipment123",
        type: "import",
        quantity: 10,
        status: "pending",
        save: jest.fn().mockResolvedValue(true),
      };
      const mockEquipment = {
        _id: "equipment123",
        quantity: 50,
        save: jest.fn().mockResolvedValue(true),
      };

      EquipmentChange.findById.mockResolvedValue(mockEquipmentChange);
      Equipment.findById.mockResolvedValue(mockEquipment);

      // Act
      const result = await equipmentChangeService.approve(changeId, userId);

      // Assert
      expect(EquipmentChange.findById).toHaveBeenCalledWith(changeId);
      expect(Equipment.findById).toHaveBeenCalledWith(mockEquipmentChange.equipmentId);
      expect(mockEquipmentChange.status).toBe("approved");
      expect(mockEquipmentChange.reviewedBy).toBe(userId);
      expect(mockEquipmentChange.save).toHaveBeenCalled();
      expect(mockEquipment.save).toHaveBeenCalled();
      expect(result).toEqual(mockEquipmentChange);
    });

    it("should throw NotFoundException when equipment change not found for approval", async () => {
      // Arrange
      const changeId = "nonexistent";
      const userId = "user123";

      EquipmentChange.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(equipmentChangeService.approve(changeId, userId)).rejects.toThrow(
        NotFoundException
      );
      await expect(equipmentChangeService.approve(changeId, userId)).rejects.toThrow(
        "Not found EquipmentChange with id: nonexistent"
      );
    });

    it("should throw NotFoundException when equipment not found for approval", async () => {
      // Arrange
      const changeId = "change123";
      const userId = "user123";
      const mockEquipmentChange = {
        _id: changeId,
        equipmentId: "nonexistent",
        type: "import",
        quantity: 10,
      };

      EquipmentChange.findById.mockResolvedValue(mockEquipmentChange);
      Equipment.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(equipmentChangeService.approve(changeId, userId)).rejects.toThrow(
        NotFoundException
      );
      await expect(equipmentChangeService.approve(changeId, userId)).rejects.toThrow(
        "Not found Equipment with id: nonexistent"
      );
    });

    it("should throw BadRequestException when not enough equipment quantity for export approval", async () => {
      // Arrange
      const changeId = "change123";
      const userId = "user123";
      const mockEquipmentChange = {
        _id: changeId,
        equipmentId: "equipment123",
        type: "export",
        quantity: 100,
        status: "pending",
      };
      const mockEquipment = {
        _id: "equipment123",
        quantity: 50,
      };

      EquipmentChange.findById.mockResolvedValue(mockEquipmentChange);
      Equipment.findById.mockResolvedValue(mockEquipment);

      // Act & Assert
      await expect(equipmentChangeService.approve(changeId, userId)).rejects.toThrow(
        BadRequestException
      );
      await expect(equipmentChangeService.approve(changeId, userId)).rejects.toThrow(
        "Not enough equipment quantity. Available: 50"
      );
    });
  });

  describe("reject", () => {
    it("should successfully reject equipment change", async () => {
      // Arrange
      const changeId = "change123";
      const reason = "Invalid request";
      const userId = "user123";
      const mockEquipmentChange = {
        _id: changeId,
        status: "pending",
        save: jest.fn().mockResolvedValue(true),
      };

      EquipmentChange.findById.mockResolvedValue(mockEquipmentChange);

      // Act
      const result = await equipmentChangeService.reject(changeId, reason, userId);

      // Assert
      expect(EquipmentChange.findById).toHaveBeenCalledWith(changeId);
      expect(mockEquipmentChange.status).toBe("rejected");
      expect(mockEquipmentChange.rejectReason).toBe(reason);
      expect(mockEquipmentChange.reviewedBy).toBe(userId);
      expect(mockEquipmentChange.save).toHaveBeenCalled();
      expect(result).toEqual(mockEquipmentChange);
    });

    it("should throw NotFoundException when equipment change not found for rejection", async () => {
      // Arrange
      const changeId = "nonexistent";
      const reason = "Invalid request";
      const userId = "user123";

      EquipmentChange.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(equipmentChangeService.reject(changeId, reason, userId)).rejects.toThrow(
        NotFoundException
      );
      await expect(equipmentChangeService.reject(changeId, reason, userId)).rejects.toThrow(
        "Not found EquipmentChange with id: nonexistent"
      );
    });
  });
});
