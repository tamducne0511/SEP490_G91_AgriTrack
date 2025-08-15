const TaskQuestion = require("../../../models/taskQuestion.model");
const Tree = require("../../../models/tree.model");
const Garden = require("../../../models/garden.model");
const Farm = require("../../../models/farm.model");
const User = require("../../../models/user.model");
const taskQuestionService = require("../../../services/taskQuestion.service");
const NotFoundException = require("../../../middlewares/exceptions/notfound");
const { USER_ROLE } = require("../../../constants/app");

// Mock all models
jest.mock("../../../models/taskQuestion.model");
jest.mock("../../../models/tree.model");
jest.mock("../../../models/garden.model");
jest.mock("../../../models/farm.model");
jest.mock("../../../models/user.model");

// Mock OpenAI and axios
jest.mock("openai", () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: "Mock AI response" } }],
        }),
      },
    },
  })),
}));

jest.mock("axios", () => ({
  get: jest.fn().mockResolvedValue({
    data: {
      location: { name: "HaNoi" },
      current: { temp_c: 25 },
    },
  }),
}));

describe("Task Question Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getListPagination", () => {
    it("should return paginated task question list with filters", async () => {
      // Arrange
      const farmId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const page = 1;
      const keyword = "test";
      const mockList = [
        {
          _doc: {
            _id: "question1",
            title: "Test Question 1",
            userId: { _id: "user1", fullName: "John Doe", email: "john@example.com" },
          },
        },
      ];

      TaskQuestion.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockList),
            }),
          }),
        }),
      });

      // Act
      const result = await taskQuestionService.getListPagination(farmId, page, keyword);

      // Assert
      expect(TaskQuestion.find).toHaveBeenCalledWith({
        farmId: farmId,
        title: { $regex: keyword, $options: "i" },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("createdBy");
    });

    it("should return paginated task question list without filters", async () => {
      // Arrange
      const farmId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const page = 1;
      const keyword = "";
      const mockList = [];

      TaskQuestion.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockList),
            }),
          }),
        }),
      });

      // Act
      const result = await taskQuestionService.getListPagination(farmId, page, keyword);

      // Assert
      expect(TaskQuestion.find).toHaveBeenCalledWith({
        farmId: farmId,
        title: { $regex: keyword, $options: "i" },
      });
      expect(result).toHaveLength(0);
    });
  });

  describe("getTotal", () => {
    it("should return total count of task questions with filters", async () => {
      // Arrange
      const farmId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const keyword = "test";
      const mockTotal = 5;

      TaskQuestion.countDocuments.mockResolvedValue(mockTotal);

      // Act
      const result = await taskQuestionService.getTotal(farmId, keyword);

      // Assert
      expect(TaskQuestion.countDocuments).toHaveBeenCalledWith({
        farmId: farmId,
        title: { $regex: keyword, $options: "i" },
      });
      expect(result).toBe(mockTotal);
    });

    it("should return total count of task questions without filters", async () => {
      // Arrange
      const farmId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const keyword = "";
      const mockTotal = 0;

      TaskQuestion.countDocuments.mockResolvedValue(mockTotal);

      // Act
      const result = await taskQuestionService.getTotal(farmId, keyword);

      // Assert
      expect(TaskQuestion.countDocuments).toHaveBeenCalledWith({
        farmId: farmId,
        title: { $regex: keyword, $options: "i" },
      });
      expect(result).toBe(mockTotal);
    });
  });

  describe("getDetail", () => {
    it("should return task question detail with related data", async () => {
      // Arrange
      const questionId = "507f1f77bcf86cd799439011"; // Valid ObjectId
      const mockTaskQuestion = { _id: questionId, treeId: "507f1f77bcf86cd799439012" };
      const mockTree = { _id: "507f1f77bcf86cd799439012", gardenId: "507f1f77bcf86cd799439013" };
      const mockGarden = { _id: "507f1f77bcf86cd799439013", farmId: "507f1f77bcf86cd799439014" };
      const mockFarm = { _id: "507f1f77bcf86cd799439014" };

      TaskQuestion.findById.mockResolvedValue(mockTaskQuestion);
      Tree.findById.mockResolvedValue(mockTree);
      Garden.findById.mockResolvedValue(mockGarden);
      Farm.findById.mockResolvedValue(mockFarm);

      // Act
      const result = await taskQuestionService.getDetail(questionId);

      // Assert
      expect(TaskQuestion.findById).toHaveBeenCalledWith(questionId);
      expect(Tree.findById).toHaveBeenCalledWith(mockTaskQuestion.treeId);
      expect(Garden.findById).toHaveBeenCalledWith(mockTree.gardenId);
      expect(Farm.findById).toHaveBeenCalledWith(mockGarden.farmId);
      expect(result).toEqual({
        detail: mockTaskQuestion,
        tree: mockTree,
        garden: mockGarden,
        farm: mockFarm,
      });
    });
  });

  describe("getListPaginationByTreeId", () => {
    it("should return paginated task questions by tree ID", async () => {
      // Arrange
      const treeId = "507f1f77bcf86cd799439012"; // Valid ObjectId
      const page = 1;
      const keyword = "test";
      const mockList = [
        {
          _doc: {
            _id: "question1",
            title: "Test Question 1",
            userId: { _id: "user1", fullName: "John Doe", email: "john@example.com" },
          },
        },
      ];

      TaskQuestion.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockList),
            }),
          }),
        }),
      });

      // Act
      const result = await taskQuestionService.getListPaginationByTreeId(treeId, page, keyword);

      // Assert
      expect(TaskQuestion.find).toHaveBeenCalledWith({
        treeId: treeId,
        title: { $regex: keyword, $options: "i" },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe("getTotalByTreeId", () => {
    it("should return total count of task questions by tree ID", async () => {
      // Arrange
      const treeId = "507f1f77bcf86cd799439012"; // Valid ObjectId
      const keyword = "test";
      const mockTotal = 3;

      TaskQuestion.countDocuments.mockResolvedValue(mockTotal);

      // Act
      const result = await taskQuestionService.getTotalByTreeId(treeId, keyword);

      // Assert
      expect(TaskQuestion.countDocuments).toHaveBeenCalledWith({
        treeId: treeId,
        title: { $regex: keyword, $options: "i" },
      });
      expect(result).toBe(mockTotal);
    });
  });

  describe("askAI", () => {
    it("should return AI response for text prompt", async () => {
      // Arrange
      const textPrompt = "What is the best way to care for this plant?";
      const mockResponse = "The best way to care for this plant is...";

      // Mock the OpenAI response
      const { OpenAI } = require("openai");
      const mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: mockResponse } }],
            }),
          },
        },
      };
      OpenAI.mockImplementation(() => mockOpenAI);

      // Act
      const result = await taskQuestionService.askAI(textPrompt);

      // Assert
      expect(result).toBe(mockResponse);
    });
  });

  describe("getWeather", () => {
    it("should return weather data", async () => {
      // Arrange
      const mockWeatherData = {
        location: { name: "HaNoi" },
        current: { temp_c: 25 },
      };

      // Mock axios
      const axios = require("axios");
      axios.get.mockResolvedValue({ data: mockWeatherData });

      // Act
      const result = await taskQuestionService.getWeather();

      // Assert
      expect(result).toEqual(mockWeatherData);
    });
  });
});
