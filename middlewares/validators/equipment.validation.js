const { body } = require("express-validator");

const create = [
  body("name").notEmpty().withMessage("Name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("categoryId").notEmpty().withMessage("CategoryId is required"),
];

const update = [
  body("name").notEmpty().withMessage("Name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("categoryId").notEmpty().withMessage("CategoryId is required"),
];

module.exports = {
  create,
  update,
};
