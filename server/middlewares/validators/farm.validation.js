const { body } = require("express-validator");

const create = [
  body("name").notEmpty().withMessage("Name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("address").notEmpty().withMessage("Address is required"),
];

const update = [
  body("name").notEmpty().withMessage("Name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("address").notEmpty().withMessage("Address is required"),
];

module.exports = {
  create,
  update,
};
