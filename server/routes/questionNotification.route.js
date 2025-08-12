const express = require("express");
const router = express.Router();

const { USER_ROLE } = require("../constants/app");
const { isRoles } = require("../middlewares");
const notificationValidation = require("../middlewares/validators/notification.validation");
const questionNotificationController = require("../controllers/questionNotification.controller");

router.get(
  "/",
  isRoles([USER_ROLE.expert]),
  questionNotificationController.getListByUser
);

router.get(
  "/:farmId",
  isRoles([USER_ROLE.farmer, USER_ROLE.expert, USER_ROLE.farmAdmin]),
  questionNotificationController.getList
);

router.post(
  "/",
  isRoles([USER_ROLE.farmer, USER_ROLE.expert]),
  notificationValidation.createQuestionNotification,
  questionNotificationController.create
);

router.get(
  "/unread/total",
  isRoles([USER_ROLE.farmer, USER_ROLE.farmAdmin, USER_ROLE.expert]),
  questionNotificationController.getTotalUnread
);

router.get(
  "/:id/mark-read",
  isRoles([USER_ROLE.farmer, USER_ROLE.farmAdmin, USER_ROLE.expert]),
  questionNotificationController.markRead
);

module.exports = router;
