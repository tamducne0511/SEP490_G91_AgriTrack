const { body } = require("express-validator");

const create = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Description is required"),
  body("treeId").notEmpty().withMessage("TreeId is required"),
];

const askAI = [
  body("textPrompt").notEmpty().withMessage("Text prompt is required"),
];

module.exports = {
  create,
  askAI,
};
