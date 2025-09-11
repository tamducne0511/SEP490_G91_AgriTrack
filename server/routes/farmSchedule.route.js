const express = require("express");
const router = express.Router();
const multer = require("multer");

const { USER_ROLE } = require("../constants/app");
const { isRoles, isExpert, isLogin } = require("../middlewares");
const farmScheduleValidation = require("../middlewares/validators/farmSchedule.validation");
const farmScheduleController = require("../controllers/farmSchedule.controller");
const { configUploadFile, fileFilter } = require("../utils/upload.util");
const upload = multer({
  storage: configUploadFile("uploads/schedules"),
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get(
  "/",
  isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]),
  farmScheduleController.getList
);
router.post(
  "/",
  isExpert,
  upload.single("image"),
  farmScheduleValidation.create,
  farmScheduleController.create
);
router.put(
  "/:id",
  isExpert,
  upload.single("image"),
  farmScheduleValidation.update,
  farmScheduleController.update
);
router.delete("/:id", isExpert, farmScheduleController.remove);
router.get(
  "/:id",
  isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]),
  farmScheduleController.find
);
router.post(
  "/generate", farmScheduleController.generateTasks);
module.exports = router;
