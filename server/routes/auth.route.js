const express = require("express");
const router = express.Router();
const multer = require("multer");

const { configUploadFile } = require("../utils/upload.util");
const { isLogin } = require("../middlewares");
const authValidator = require("../middlewares/validators/auth.validation");
const upload = multer({ storage: configUploadFile("uploads/users") });
const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);
router.get("/me", isLogin, authController.getMe);
router.post(
  "/update-profile",
  isLogin,
  upload.single("image"),
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
