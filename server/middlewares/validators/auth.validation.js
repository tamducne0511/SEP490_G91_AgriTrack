const { body } = require("express-validator");

const update = [
  body("fullName").notEmpty().withMessage("fullName is required"),
];

const changePassword = [
  body("currentPassword").notEmpty().withMessage("currentPassword is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("newPassword is required")
    .isLength({ min: 6 })
    .withMessage("newPassword must be at least 6 characters long"),
];

module.exports = {
  update,
  changePassword,
};
