const express = require("express");
const router = express.Router();
const multer = require("multer");

const { USER_ROLE } = require("../constants/app");
const { isRoles, isLogin, isExpert } = require("../middlewares");
const farmQuestionValidation = require("../middlewares/validators/taskQuestion.validation");
const taskQuestionController = require("../controllers/taskQuestion.controller");
const { configUploadFile } = require("../utils/upload.util");
const upload = multer({ storage: configUploadFile("uploads/questions") });

router.get("/", isLogin, taskQuestionController.getList);
router.get("/:id", isLogin, taskQuestionController.getDetail);
router.get("/tree/:treeId", isLogin, taskQuestionController.getListByTreeId);
router.post(
  "/",
  isRoles([USER_ROLE.farmer, USER_ROLE.expert]),
  upload.single("image"),
  farmQuestionValidation.create,
  taskQuestionController.create
);
router.post(
  "/ask-ai",
  isExpert,
  farmQuestionValidation.askAI,
  taskQuestionController.askAI
);
router.get("/weather/get", isLogin, taskQuestionController.getWeather);

module.exports = router;
