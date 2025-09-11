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

const assignExpertToFarm = [
  body("expertId").notEmpty().withMessage("Expert ID is required"),
  body("farmId").notEmpty().withMessage("Farm ID is required"),
];

const adminChangePassword = [
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .notEmpty()
    .withMessage("New password is required"),
];
module.exports = {
  create,
  assignFarmToUser,
  createFarmer,
  assignExpertToFarm,
  adminChangePassword,
};
