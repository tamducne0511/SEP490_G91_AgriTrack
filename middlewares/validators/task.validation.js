const { body } = require("express-validator");

const create = [
  body("name").notEmpty().withMessage("Name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("gardenId").notEmpty().withMessage("GardenId is required"),
  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["collect", "task-care"])
    .withMessage("Type must be collect or task-care"),
  body("priority")
    .notEmpty()
    .withMessage("Priority is required")
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
];

const update = [
  body("name").notEmpty().withMessage("Name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("gardenId").notEmpty().withMessage("GardenId is required"),
  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["collect", "task-care"])
    .withMessage("Type must be collect or task-care"),
  body("priority")
    .notEmpty()
    .withMessage("Priority is required")
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
];

module.exports = {
  create,
  update,
};
