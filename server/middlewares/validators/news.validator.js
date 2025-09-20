const { body } = require("express-validator");

const createNewsValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters")
    .trim(),

  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters long"),

  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Status must be draft, published, or archived"),
];

const updateNewsValidator = [
  body("title")
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters")
    .trim(),

  body("content")
    .optional()
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters long"),

  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Status must be draft, published, or archived"),
];

module.exports = {
  createNewsValidator,
  updateNewsValidator,
};
