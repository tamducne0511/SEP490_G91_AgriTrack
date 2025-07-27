const { validationResult } = require("express-validator");
const questionNotificationService = require("../services/questionNotification.service");
const { io } = require("../app");

const getList = async (req, res) => {
  const list = await questionNotificationService.getList(req.params.farmId);

  return res.status(200).json({
    message: "List of question notifications",
    data: list,
  });
};

const getListByUser = async (req, res) => {
  const userId = req.user.id;
  const list = await questionNotificationService.getListByUser(userId);

  return res.status(200).json({
    message: "List of question notifications for user",
    data: list,
  });
};

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const payload = {
    title: req.body.title,
    content: req.body.content,
    questionId: req.body.questionId,
    userId: req.user.id,
  };

  const notification = await questionNotificationService.create(payload);
  // Emit socket khi có notification hỏi đáp mới
  io.emit("new-question-notification", notification);
  res.status(201).json({
    message: "Notification created successfully",
    data: notification,
  });
};

module.exports = {
  getList,
  create,
  getListByUser,
};
