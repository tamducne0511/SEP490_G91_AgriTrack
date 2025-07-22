const { body } = require("express-validator");

const create = [
  body("title").notEmpty().withMessage("Title is required"),
  body("treeName").notEmpty().withMessage("Tree name is required"),
  body("treeDescription")
    .notEmpty()
    .withMessage("Tree description is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("startAt").notEmpty().withMessage("StartAt is required"),
  body("endAt").notEmpty().withMessage("EndAt is required"),
  body("farmId").notEmpty().withMessage("FarmId is required"),
];

const update = [
  body("title").notEmpty().withMessage("Title is required"),
  body("treeName").notEmpty().withMessage("Tree name is required"),
  body("treeDescription")
    .notEmpty()
    .withMessage("Tree description is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("startAt").notEmpty().withMessage("StartAt is required"),
  body("endAt").notEmpty().withMessage("EndAt is required"),
];

module.exports = {
  create,
  update,
};