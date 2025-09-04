const { validationResult } = require("express-validator");
const { formatPagination } = require("../utils/format.util");
const taskQuestionService = require("../services/taskQuestion.service");
const { io } = require("../app");

// Get list task question with pagination and keyword search
const getList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";
  const list = await taskQuestionService.getListPagination(
    req.query.farmId,
    page,
    keyword
  );
  const total = await taskQuestionService.getTotal(req.query.farmId, keyword);
  res.json(formatPagination(page, total, list));
};

// Get detail of a task question by ID
const getDetail = async (req, res) => {
  const id = req.params.id;
  const taskQuestion = await taskQuestionService.getDetail(id);
  if (!taskQuestion) {
    return res.status(404).json({ message: "Task question not found" });
  }

  res.json({
    message: "Task question retrieved successfully",
    data: taskQuestion,
  });
};

// Get list task question by treeId
const getListByTreeId = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";
  const list = await taskQuestionService.getListPaginationByTreeId(
    req.params.treeId,
    page,
    keyword
  );
  const total = await taskQuestionService.getTotalByTreeId(
    req.params.treeId,
    keyword
  );
  res.json(formatPagination(page, total, list));
};

// Create new task question
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const payload = {
    title: req.body.title,
    content: req.body.content,
    farmId: req.body.farmId,
    treeId: req.body.treeId,
    image: req.file?.filename ? `/uploads/questions/${req.file.filename}` : "",
    parentId: req.body.parentId || null,
  };

  const taskQuestion = await taskQuestionService.create(req.user.id, payload);
  // Emit socket: nếu có parentId là trả lời, không có là câu hỏi mới
  if (payload.parentId) {
    io.emit("new-answer", taskQuestion);
  } else {
    io.emit("new-question", taskQuestion);
  }
  res.status(201).json({
    message: "Task question created successfully",
    data: taskQuestion,
  });
};

// Ask AI for task question
const askAI = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { textPrompt } = req.body;
    const response = await taskQuestionService.askAI(
      textPrompt,
      req.body.imageUrl
    );
    res.status(200).json({
      message: "AI response received successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const getWeather = async (req, res) => {
  const location = req.query.location || "HaNoi";
  const weatherData = await taskQuestionService.getWeather(location);
  res.json({
    message: "Weather data retrieved successfully",
    data: weatherData,
  });
};

module.exports = {
  getList,
  create,
  getListByTreeId,
  askAI,
  getWeather,
  getDetail,
};
