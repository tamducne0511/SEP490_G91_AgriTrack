const { validationResult } = require("express-validator");
const { formatPagination } = require("../utils/format.util");
const farmScheduleService = require("../services/farmSchedule.service");
const e = require("cors");
const NotFoundException = require("../middlewares/exceptions/notfound");

// Get list farm schedule with pagination and keyword search
const getList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";
  const list = await farmScheduleService.getListPagination(
    req.query.farmId,
    page,
    keyword
  );
  const total = await farmScheduleService.getTotal(req.query.farmId, keyword);
  res.json(formatPagination(page, total, list));
};

// Create new farm schedule
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const payload = {
    title: req.body.title,
    description: req.body.description,
    startAt: req.body.startAt,
    endAt: req.body.endAt,
    farmId: req.body.farmId,
    treeName: req.body.treeName,
    treeDescription: req.body.treeDescription,
    image: req.file?.filename ? `/uploads/schedules/${req.file.filename}` : "",
  };

  const farmSchedule = await farmScheduleService.create(req.user.id, payload);
  res.status(201).json({
    message: "Farm Schedule created successfully",
    data: farmSchedule,
  });
};

// Update existed farm schedule
const update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const farmSchedule = await farmScheduleService.update(id, {
      title: req.body.title,
      description: req.body.description,
      startAt: req.body.startAt,
      endAt: req.body.endAt,
      treeName: req.body.treeName,
      treeDescription: req.body.treeDescription,
      image: req.file?.filename
        ? `/uploads/schedules/${req.file.filename}`
        : "",
    });

    res.json({
      message: "Schedule updated successfully",
      data: farmSchedule,
    });
  } catch (error) {
    next(error);
  }
};

// Delete farm schedule
const remove = async (req, res) => {
  const id = req.params.id;
  const farmSchedule = await farmScheduleService.find(id);
  if (!farmSchedule) {
    next(new NotFoundException("Not found schedule with id: " + id));
  }

  await farmScheduleService.remove(id);
  res.json({
    message: "Schedule deleted successfully",
  });
};

// Get detail
const find = async (req, res, next) => {
  const id = req.params.id;
  const farmSchedule = await farmScheduleService.find(id);
  if (!farmSchedule) {
    return next(new NotFoundException("Not found schedule with id: " + id));
  }
  res.json({
    message: "Schedule found successfully",
    data: farmSchedule,
  });
};
const generateTasks = async (req, res, next) => {
  try {
    const { scheduleId } = req.body;

    const farmSchedule = await farmScheduleService.find(scheduleId);
    if (!farmSchedule) {
      return res.status(404).json({ message: "FarmSchedule not found" });
    }

    const tasks = await farmScheduleService.generateTasksFromSchedule(farmSchedule);

    res.status(201).json({
      message: "Tasks generated successfully from FarmSchedule description",
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  getList,
  create,
  update,
  remove,
  find,
  generateTasks,
};
