const express = require("express");
const router = express.Router();
const multer = require("multer");

const taskValidation = require("../../middlewares/validators/task.validation");
const taskController = require("../../controllers/admin/task.controller");
const { configUploadFile, fileFilter } = require("../../utils/upload.util");
const { USER_ROLE } = require("../../constants/app");
const { isFarmAdmin, isExpert, isRoles } = require("../../middlewares");
const upload = multer({
  storage: configUploadFile("uploads/tasks"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]), taskController.getList);
router.post(
  "/",
  isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]),
  upload.single("image"),
  taskValidation.create,
  taskController.create
);
router.put(
  "/:id",
  isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]),
  upload.single("image"),
  taskValidation.update,
  taskController.update
);
router.delete("/:id", isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]), taskValidation.deleteTask, taskController.remove);
router.get("/:id", isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]), taskController.find);
router.post("/:id/assign-farmer", isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]), taskController.assignFarmer);
router.get("/export/excel", taskController.exportExcel);
module.exports = router;