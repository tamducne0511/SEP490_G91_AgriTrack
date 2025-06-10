const express = require("express");
const router = express.Router();
const { isLogin } = require("../middlewares");
const authValidator = require("../middlewares/validators/auth.validation");

const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);
router.get("/me", isLogin, authController.getMe);
router.post(
  "/update-profile",
  isLogin,
  authValidator.update,
  authController.updateProfile
);
router.post(
  "/change-password",
  isLogin,
  authValidator.changePassword,
  authController.changePassword
);

module.exports = router;
