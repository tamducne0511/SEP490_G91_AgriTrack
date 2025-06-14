const { formatPagination } = require("../../utils/format.util");
const taskService = require("../../services/task.service");
const taskDailyNoteService = require("../../services/taskDailyNoteService");
const { validationResult } = require("express-validator");
const NotFoundException = require("../../middlewares/exceptions/notfound");

// Get list task with pagination and keyword search
const getList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";
  const list = await taskService.getListAssignedPagination(
    req.user.farmId,
    req.user.id,
    page,
    keyword
  );
  const total = await taskService.getTotalAssigned(
    req.user.farmId,
    req.user.id,
    keyword
  );
  res.json(formatPagination(page, total, list));
};

// Get detail
const find = async (req, res, next) => {
  const id = req.params.id;
  const task = await taskService.getDetail(id);
  if (!task) {
    return next(new NotFoundException("Not found task with id: " + id));
  }
  res.json({
    message: "Task found successfully",
    data: task,
  });
};

// Change status
const changeStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const status = req.body.status;
    const task = await taskService.changeStatusAssigned(
      id,
      req.user.id,
      status
    );

    res.json({
      message: "Task status changed successfully",
      data: task,
    });
  } catch (error) {
    return next(error);
  }
};

const createDailyNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const task = await taskDailyNoteService.create(id, req.user.id, {
      ...req.body,
      image: req.file?.filename
        ? `/uploads/tasknotes/${req.file.filename}`
        : "",
    });
    res.json({
      message: "Create daily note successfully",
      data: task,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getList,
  find,
  changeStatus,
  createDailyNote,
};