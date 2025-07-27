const { body } = require("express-validator");

const create = [
  body("farmId").notEmpty().withMessage("FarmId is required"),
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Description is required"),
];

const update = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Description is required"),
];

const createQuestionNotification = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required"),
  body("questionId").notEmpty().withMessage("Question ID is required"),
];

module.exports = {
  create,
  update,
  createQuestionNotification,
};
