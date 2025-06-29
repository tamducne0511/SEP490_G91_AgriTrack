const { body } = require("express-validator");

const update = [
  body("fullName").notEmpty().withMessage("FullName is required"),
  body("phone").notEmpty().withMessage("Phone is required"),
  body("gender").notEmpty().withMessage("Gender is required"),
  body("address").notEmpty().withMessage("Address is required"),
  body("birthday").notEmpty().withMessage("Birthday is required"),
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