const { validationResult } = require("express-validator");
const { formatPagination } = require("../utils/format.util");
const notificationService = require("../services/notification.service");

// Get list notification with pagination and keyword search
const getList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";
  const list = await notificationService.getListPagination(
    req.user.farmId,
    page,
    keyword
  );
  const total = await notificationService.getTotal(req.user.farmId, keyword);
  res.json(formatPagination(page, total, list));
};

// Get list notification with pagination and keyword search
const getListForExpert = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";
  const list = await notificationService.getListPagination(
    req.params.farmId,
    page,
    keyword
  );
  const total = await notificationService.getTotal(req.user.farmId, keyword);
  res.json(formatPagination(page, total, list));
};

// Create new notification
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const payload = {
    title: req.body.title,
    content: req.body.content,
    farmId: req.body.farmId,
    image: req.file?.filename
      ? `/uploads/notifications/${req.file.filename}`
      : "",
  };

  const notification = await notificationService.create(payload);
  res.status(201).json({
    message: "Notification created successfully",
    data: notification,
  });
};

// Update existed notification
const update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const notification = await notificationService.update(id, {
      title: req.body.title,
      content: req.body.content,
      image: req.file?.filename
        ? `/uploads/notifications/${req.file.filename}`
        : "",
    });

    res.json({
      message: "Notification updated successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification
const remove = async (req, res) => {
  const id = req.params.id;
  const notification = await notificationService.find(id);
  if (!notification) {
    next(new NotFoundException("Not found notification with id: " + id));
  }

  await notificationService.remove(id);
  res.json({
    message: "Notification deleted successfully",
  });
};

// Get detail
const find = async (req, res, next) => {
  const id = req.params.id;
  const notification = await notificationService.find(id);
  if (!notification) {
    return next(new NotFoundException("Not found notification with id: " + id));
  }
  res.json({
    message: "Notification found successfully",
    data: notification,
  });
};

module.exports = {
  getList,
  getListForExpert,
  create,
  update,
  remove,
  find,
};
