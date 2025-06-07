const express = require("express");
const router = express.Router();
const multer = require("multer");

const notificationValidation = require("../../middlewares/validators/notification.validation");
const notificationController = require("../../controllers/admin/notification.controller");
const { configUploadFile } = require("../../utils/upload.util");
const { isFarmAdmin } = require("../../middlewares");
const upload = multer({ storage: configUploadFile("uploads/notifications") });

router.get("/", isFarmAdmin, notificationController.getList);
router.post(
  "/",
  isFarmAdmin,
  upload.single("image"),
  notificationValidation.create,
  notificationController.create
);
router.put(
  "/:id",
  isFarmAdmin,
  upload.single("image"),
  notificationValidation.update,
  notificationController.update
);
router.delete("/:id", isFarmAdmin, notificationController.remove);
router.get("/:id", isFarmAdmin, notificationController.find);

module.exports = router;
