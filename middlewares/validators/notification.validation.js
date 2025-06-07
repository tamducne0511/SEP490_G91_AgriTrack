const { body } = require("express-validator");

const create = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Description is required"),
];

const update = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Description is required"),
];

module.exports = {
  create,
  update,
};
