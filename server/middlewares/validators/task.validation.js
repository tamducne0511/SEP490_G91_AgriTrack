const { body } = require("express-validator");
const { TASK_ASSIGN_STATUS } = require("../../constants/app");

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

const changeStatus = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn([
      TASK_ASSIGN_STATUS.inprogress,
      TASK_ASSIGN_STATUS.canceled,
      TASK_ASSIGN_STATUS.completed,
    ])
    .withMessage(
      `Status must be [${TASK_ASSIGN_STATUS.inprogress}, ${TASK_ASSIGN_STATUS.canceled}, ${TASK_ASSIGN_STATUS.completed}]`
    ),
];

const createDailyNote = [
  body("title").notEmpty().withMessage("Title is required"),
  body("comment").notEmpty().withMessage("Comment is required"),
  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["harvest", "consumption"])
    .withMessage("Type must be harvest or consumption"),
  body("quantity")
    .optional()
    .isNumeric()
    .withMessage("Quantity must be a number"),
];

module.exports = {
  create,
  update,
  createDailyNote,
  changeStatus,
};
