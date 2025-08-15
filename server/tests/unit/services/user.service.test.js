const User = require("../../../models/user.model");
const Farm = require("../../../models/farm.model");
const Task = require("../../../models/task.model");
const ExpertFarm = require("../../../models/expertFarm.model");
const userService = require("../../../services/user.service");
const BadRequestException = require("../../../middlewares/exceptions/badrequest");
const { USER_ROLE } = require("../../../constants/app");

// Mock all models
jest.mock("../../../models/user.model");
jest.mock("../../../models/farm.model");
jest.mock("../../../models/task.model");
jest.mock("../../../models/expertFarm.model");

describe("User Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getListPagination", () => {
    it("should return paginated user list with role filter", async () => {
      // Arrange
      const role = "farmer";
      const page = 1;
      const keyword = "test";
      const mockUsers = [
        { _id: "user1", fullName: "User 1", role: "farmer" },
        { _id: "user2", fullName: "User 2", role: "farmer" },
      ];

      User.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockUsers),
          }),
        }),
      });

      // Act
      const result = await userService.getListPagination(role, page, keyword);

      // Assert
      expect(User.find).toHaveBeenCalledWith({
        fullName: { $regex: keyword, $options: "i" },
        role: role,
      });
      expect(result).toEqual(mockUsers);
    });

    it("should return paginated user list without role filter", async () => {
      // Arrange
      const page = 1;
      const keyword = "test";
      const mockUsers = [
        { _id: "user1", fullName: "User 1", role: "farmer" },
        { _id: "user2", fullName: "User 2", role: "farmAdmin" },
      ];

      User.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockUsers),
          }),
        }),
      });

      // Act
      const result = await userService.getListPagination(null, page, keyword);

      // Assert
      expect(User.find).toHaveBeenCalledWith({
        fullName: { $regex: keyword, $options: "i" },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe("getListFarmerInFarm", () => {
    it("should return paginated farmer list in farm", async () => {
      // Arrange
      const farmId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const page = 1;
      const keyword = "test";
      const mockFarmers = [
        { _id: "farmer1", fullName: "Farmer 1", role: "farmer" },
        { _id: "farmer2", fullName: "Farmer 2", role: "farmer" },
      ];

      User.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockFarmers),
          }),
        }),
      });

      // Act
      const result = await userService.getListFarmerInFarm(farmId, page, keyword);

      // Assert
      expect(User.find).toHaveBeenCalledWith({
        farmId: expect.any(Object),
        role: USER_ROLE.farmer,
        fullName: { $regex: keyword, $options: "i" },
      });
      expect(result).toEqual(mockFarmers);
    });
  });

  describe("getTotal", () => {
    it("should return total count of users with role filter", async () => {
      // Arrange
      const role = "farmer";
      const keyword = "test";
      const mockTotal = 10;

      User.countDocuments.mockResolvedValue(mockTotal);

      // Act
      const result = await userService.getTotal(role, keyword);

      // Assert
      expect(User.countDocuments).toHaveBeenCalledWith({
        role: role,
        fullName: { $regex: keyword, $options: "i" },
      });
      expect(result).toBe(mockTotal);
    });

    it("should return total count of users without role filter", async () => {
      // Arrange
      const keyword = "test";
      const mockTotal = 25;

      User.countDocuments.mockResolvedValue(mockTotal);

      // Act
      const result = await userService.getTotal(null, keyword);

      // Assert
      expect(User.countDocuments).toHaveBeenCalledWith({
        role: null,
        fullName: { $regex: keyword, $options: "i" },
      });
      expect(result).toBe(mockTotal);
    });
  });

  describe("getTotalFarmerInFarm", () => {
    it("should return total count of farmers in farm", async () => {
      // Arrange
      const farmId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const keyword = "test";
      const mockTotal = 5;

      User.countDocuments.mockResolvedValue(mockTotal);

      // Act
      const result = await userService.getTotalFarmerInFarm(farmId, keyword);

      // Assert
      expect(User.countDocuments).toHaveBeenCalledWith({
        farmId: expect.any(Object),
        role: USER_ROLE.farmer,
        fullName: { $regex: keyword, $options: "i" },
      });
      expect(result).toBe(mockTotal);
    });
  });

  describe("create", () => {
    it("should successfully create a new user", async () => {
      // Arrange
      const userData = {
        email: "newuser@example.com",
        fullName: "New User",
        password: "password123",
        role: "farmer",
      };

      const mockUser = {
        _id: "user123",
        ...userData,
        save: jest.fn().mockResolvedValue(true),
      };

      User.find.mockResolvedValue([]);
      User.mockImplementation(() => mockUser);

      // Act
      const result = await userService.create(userData);

      // Assert
      expect(User.find).toHaveBeenCalledWith({ email: userData.email });
      expect(User).toHaveBeenCalledWith(userData);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("should throw BadRequestException when email already exists", async () => {
      // Arrange
      const userData = {
        email: "existing@example.com",
        fullName: "Existing User",
        password: "password123",
        role: "farmer",
      };

      User.find.mockResolvedValue([{ email: userData.email }]);

      // Act & Assert
      await expect(userService.create(userData)).rejects.toThrow(BadRequestException);
      await expect(userService.create(userData)).rejects.toThrow("Email already exists");
    });
  });

  describe("assignFarmToUser", () => {
    it("should successfully assign farm to expert user", async () => {
      // Arrange
      const userId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const farmId = "507f1f77bcf86cd799439012"; // Valid ObjectId
      const mockUser = {
        _id: userId,
        role: USER_ROLE.expert,
        farmId: null,
        save: jest.fn().mockResolvedValue(true),
      };
      const mockFarm = {
        _id: farmId,
        name: "Test Farm",
      };

      User.findById.mockResolvedValue(mockUser);
      Farm.findById.mockResolvedValue(mockFarm);

      // Act
      await userService.assignFarmToUser(userId, farmId);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(Farm.findById).toHaveBeenCalledWith(farmId);
      expect(mockUser.farmId).toBe(farmId);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should successfully assign farm to farm admin user", async () => {
      // Arrange
      const userId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const farmId = "507f1f77bcf86cd799439012"; // Valid ObjectId
      const mockUser = {
        _id: userId,
        role: USER_ROLE.farmAdmin,
        farmId: null,
        save: jest.fn().mockResolvedValue(true),
      };
      const mockFarm = {
        _id: farmId,
        name: "Test Farm",
      };

      User.findById.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue(null);
      Farm.findById.mockResolvedValue(mockFarm);

      // Act
      await userService.assignFarmToUser(userId, farmId);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(Farm.findById).toHaveBeenCalledWith(farmId);
      expect(mockUser.farmId).toBe(farmId);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should throw BadRequestException when user not found", async () => {
      // Arrange
      const userId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const farmId = "507f1f77bcf86cd799439012"; // Valid ObjectId

      User.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.assignFarmToUser(userId, farmId)).rejects.toThrow(
        BadRequestException
      );
      await expect(userService.assignFarmToUser(userId, farmId)).rejects.toThrow(
        "User not found"
      );
    });

    it("should throw BadRequestException when user role is not expert or farm admin", async () => {
      // Arrange
      const userId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const farmId = "507f1f77bcf86cd799439012"; // Valid ObjectId
      const mockUser = {
        _id: userId,
        role: USER_ROLE.farmer,
      };

      User.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.assignFarmToUser(userId, farmId)).rejects.toThrow(
        BadRequestException
      );
      await expect(userService.assignFarmToUser(userId, farmId)).rejects.toThrow(
        "Only farm admin or expert can be assigned a farm"
      );
    });

    it("should throw BadRequestException when farm is already assigned to user", async () => {
      // Arrange
      const userId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const farmId = "507f1f77bcf86cd799439012"; // Valid ObjectId
      const mockUser = {
        _id: userId,
        role: USER_ROLE.expert,
        farmId: farmId,
      };

      User.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.assignFarmToUser(userId, farmId)).rejects.toThrow(
        BadRequestException
      );
      await expect(userService.assignFarmToUser(userId, farmId)).rejects.toThrow(
        "Farm already assigned to this user"
      );
    });

    it("should throw BadRequestException when farm not found", async () => {
      // Arrange
      const userId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const farmId = "507f1f77bcf86cd799439012"; // Valid ObjectId
      const mockUser = {
        _id: userId,
        role: USER_ROLE.expert,
        farmId: null,
      };

      User.findById.mockResolvedValue(mockUser);
      Farm.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.assignFarmToUser(userId, farmId)).rejects.toThrow(
        BadRequestException
      );
      await expect(userService.assignFarmToUser(userId, farmId)).rejects.toThrow(
        "Farm not found"
      );
    });

    it("should throw BadRequestException when farm already assigned to another farm admin", async () => {
      // Arrange
      const userId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const farmId = "507f1f77bcf86cd799439012"; // Valid ObjectId
      const mockUser = {
        _id: userId,
        role: USER_ROLE.farmAdmin,
        farmId: null,
      };
      const mockFarm = {
        _id: farmId,
        name: "Test Farm",
      };
      const existingUser = {
        _id: "otherAdmin",
        role: USER_ROLE.farmAdmin,
        farmId: farmId,
      };

      User.findById.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue(existingUser);
      Farm.findById.mockResolvedValue(mockFarm);

      // Act & Assert
      await expect(userService.assignFarmToUser(userId, farmId)).rejects.toThrow(
        BadRequestException
      );
      await expect(userService.assignFarmToUser(userId, farmId)).rejects.toThrow(
        "Farm already assigned to another user"
      );
    });
  });

  describe("find", () => {
    it("should return user by id", async () => {
      // Arrange
      const userId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const mockUser = {
        _id: userId,
        fullName: "Test User",
        email: "test@example.com",
        role: "farmer",
      };

      User.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.find(userId);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      // Arrange
      const userId = "507f1f77bcf86cd799439011"; // Valid ObjectId

      User.findById.mockResolvedValue(null);

      // Act
      const result = await userService.find(userId);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should successfully update user", async () => {
      // Arrange
      const userId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const updateData = {
        fullName: "Updated Name",
        phone: "1234567890",
        address: "Updated Address",
        gender: "male",
        birthday: "1990-01-01",
      };
      const mockUser = {
        _id: userId,
        fullName: "Original Name",
        phone: "original",
        address: "original",
        gender: "original",
        birthday: "original",
        avatar: "original",
        save: jest.fn().mockResolvedValue(true),
      };

      User.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.update(userId, updateData);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.fullName).toBe(updateData.fullName);
      expect(mockUser.phone).toBe(updateData.phone);
      expect(mockUser.address).toBe(updateData.address);
      expect(mockUser.gender).toBe(updateData.gender);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found for update", async () => {
      // Arrange
      const userId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const updateData = {
        fullName: "Updated Name",
      };

      User.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.update(userId, updateData)).rejects.toThrow(
        BadRequestException
      );
      await expect(userService.update(userId, updateData)).rejects.toThrow("User not found");
    });
  });
});
