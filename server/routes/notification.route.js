const express = require("express");
const router = express.Router();
const multer = require("multer");

const { USER_ROLE } = require("../constants/app");
const { isRoles } = require("../middlewares");
const notificationValidation = require("../middlewares/validators/notification.validation");
const notificationController = require("../controllers/notification.controller");
const { configUploadFile } = require("../utils/upload.util");
const upload = multer({ storage: configUploadFile("uploads/notifications") });

router.get(
  "/",
  isRoles([USER_ROLE.farmer, USER_ROLE.farmAdmin]),
  notificationController.getList
);
router.get(
  "/unread/total",
  isRoles([USER_ROLE.farmer, USER_ROLE.farmAdmin]),
  notificationController.getTotalUnread
);
router.get(
  "/:id/mark-read",
  isRoles([USER_ROLE.farmer, USER_ROLE.farmAdmin]),
  notificationController.markRead
);
router.get(
  "/expert/:farmId",
  isRoles([USER_ROLE.expert]),
  notificationController.getListForExpert
);
router.post(
  "/",
  isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]),
  upload.single("image"),
  notificationValidation.create,
  notificationController.create
);
router.put(
  "/:id",
  isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]),
  upload.single("image"),
  notificationValidation.update,
  notificationController.update
);
router.delete(
  "/:id",
  isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]),
  notificationController.remove
);
router.get(
  "/:id",
  isRoles([USER_ROLE.farmer, USER_ROLE.farmAdmin, USER_ROLE.expert]),
  notificationController.find
);

module.exports = router;
