const express = require("express");
const router = express.Router();
const multer = require("multer");

const { configUploadFile } = require("../../utils/upload.util");
const upload = multer({ storage: configUploadFile("uploads/tasknotes") });
const taskController = require("../../controllers/web/task.controller");
const taskValidation = require("../../middlewares/validators/task.validation");
const { isFarmer, isLogin } = require("../../middlewares");

router.get("/", isFarmer, taskController.getList);
router.post(
  "/:id/change-status",
  isFarmer,
  taskValidation.changeStatus,
  taskController.changeStatus
);
router.get("/:id", isFarmer, taskController.find);
router.post(
  "/:id/daily-note",
  isFarmer,
  upload.single("image"),
  taskValidation.createDailyNote,
  taskController.createDailyNote
);
router.get("/:id/daily-note", isLogin, taskController.getDailyNote);
router.get("/daily-note/:id", isLogin, taskController.getDetailDailyNote);

module.exports = router;
