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
  isRoles([USER_ROLE.farmer, USER_ROLE.expert]),
  questionNotificationController.getList
);

router.post(
  "/",
  isRoles([USER_ROLE.farmer, USER_ROLE.expert]),
  notificationValidation.createQuestionNotification,
  questionNotificationController.create
);

module.exports = router;
