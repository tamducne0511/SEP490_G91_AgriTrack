const { body } = require("express-validator");

const create = [
  body("email")
    .isEmail()
    .withMessage("Email is invalid")
    .notEmpty()
    .withMessage("Email is required"),
  body("fullName").notEmpty().withMessage("FullName is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .notEmpty()
    .withMessage("Password is required"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["farm-admin", "expert"])
    .withMessage("Role must be either 'farm-admin' or 'expert'"),
];

const createFarmer = [
  body("email")
    .isEmail()
    .withMessage("Email is invalid")
    .notEmpty()
    .withMessage("Email is required"),
  body("fullName").notEmpty().withMessage("FullName is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .notEmpty()
    .withMessage("Password is required"),
];

const assignFarmToUser = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("farmId").notEmpty().withMessage("Farm ID is required"),
];

module.exports = {
  create,
  assignFarmToUser,
  createFarmer,
};
