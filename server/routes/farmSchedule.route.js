const express = require("express");
const router = express.Router();
const multer = require("multer");

const { USER_ROLE } = require("../constants/app");
const { isRoles, isExpert } = require("../middlewares");
const farmScheduleValidation = require("../middlewares/validators/farmSchedule.validation");
const farmScheduleController = require("../controllers/farmSchedule.controller");
const { configUploadFile } = require("../utils/upload.util");
const upload = multer({ storage: configUploadFile("uploads/schedules") });

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

module.exports = router;