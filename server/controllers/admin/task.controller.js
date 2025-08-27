const { validationResult } = require("express-validator");
const { formatPagination } = require("../../utils/format.util");
const taskService = require("../../services/task.service");
const NotFoundException = require("../../middlewares/exceptions/notfound");

// Get list task with pagination and keyword search
const getList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const keyword = req.query.keyword || "";
  const gardenId = req.query.gardenId || null;
  const farmId = req.user.role === "expert" ? (req.query.farmId || null) : req.user.farmId;

  const list = await taskService.getListPagination(
    farmId,
    gardenId,
    page,
    keyword,
    pageSize
  );
  
  if (pageSize >= 1000) {
    res.json({
      data: list,
      totalItem: list.length,
      page: 1,
      pageSize: list.length,
    });
  } else {
    const total = await taskService.getTotal(farmId, gardenId, keyword);
    res.json(formatPagination(page, total, list));
  }
};

// Create new task
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Xử lý farmId cho expert
  let farmId;
  if (req.user.role === "expert") {
    farmId = req.body.farmId; // Expert sẽ gửi farmId cụ thể
  } else {
    farmId = req.user.farmId; // Farm-admin chỉ có 1 farm
  }

  const payload = {
    name: req.body.name,
    description: req.body.description,
    type: req.body.type,
    priority: req.body.priority,
    farmId: req.user.role === "expert" ? req.body.farmId : req.user.farmId,
    gardenId: req.body.gardenId,
    image: req.file?.filename ? `/uploads/tasks/${req.file.filename}` : "",
    startDate: req.body.startDate !== "null" ? new Date(req.body.startDate) : null,
    endDate: req.body.endDate !== "null" ? new Date(req.body.endDate) : null,
    createdBy: req.user.id,
  };

  const task = await taskService.create(payload);
  res.status(201).json({
    message: "Task created successfully",
    data: task,
  });
};

// Update existed task
const update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const task = await taskService.update(id, {
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      priority: req.body.priority,
      gardenId: req.body.gardenId,
      image: req.file?.filename ? `/uploads/tasks/${req.file.filename}` : "",
    });

    res.json({
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Delete task
const remove = async (req, res) => {
  const id = req.params.id;
  const task = await taskService.find(id);
  if (!task) {
    next(new NotFoundException("Not found task with id: " + id));
  }

  await taskService.remove(id);
  res.json({
    message: "Task deleted successfully",
  });
};

// Get detail
const find = async (req, res, next) => {
  const id = req.params.id;
  const task = await taskService.find(id);
  if (!task) {
    return next(new NotFoundException("Not found task with id: " + id));
  }
  res.json({
    message: "Task found successfully",
    data: task,
  });
};

// Assign farmer to task
const assignFarmer = async (req, res, next) => {
  const id = req.params.id;
  const farmerId = req.body.farmerId;
  const result = await taskService.assignFarmer(id, farmerId);
  res.json({
    message: "Assigned farmer to task successfully",
    data: result,
  });
};

module.exports = {
  getList,
  create,
  update,
  remove,
  find,
  assignFarmer,
};
