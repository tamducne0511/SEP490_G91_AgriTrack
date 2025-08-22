const express = require("express");
const router = express.Router();
const multer = require("multer");

const taskValidation = require("../../middlewares/validators/task.validation");
const taskController = require("../../controllers/admin/task.controller");
const { configUploadFile, fileFilter } = require("../../utils/upload.util");
const { isFarmAdmin } = require("../../middlewares");
const upload = multer({
  storage: configUploadFile("uploads/tasks"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", isFarmAdmin, taskController.getList);
router.post(
  "/",
  isFarmAdmin,
  upload.single("image"),
  taskValidation.create,
  taskController.create
);
router.put(
  "/:id",
  isFarmAdmin,
  upload.single("image"),
  taskValidation.update,
  taskController.update
);
router.delete("/:id", isFarmAdmin, taskController.remove);
router.get("/:id", isFarmAdmin, taskController.find);
router.post("/:id/assign-farmer", isFarmAdmin, taskController.assignFarmer);

module.exports = router;