const express = require("express");
const router = express.Router();
const multer = require("multer");

const { configUploadFile, fileFilter } = require("../../utils/upload.util");
const upload = multer({
  storage: configUploadFile("uploads/equipments"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
const equipmentValidation = require("../../middlewares/validators/equipment.validation");
const equipmentController = require("../../controllers/admin/equipment.controller");
const { isFarmAdmin } = require("../../middlewares");

router.get("/", isFarmAdmin, equipmentController.getList);
router.post(
  "/",
  isFarmAdmin,
  upload.single("image"),
  equipmentValidation.create,
  equipmentController.create
);
router.put(
  "/:id",
  isFarmAdmin,
  upload.single("image"),
  equipmentValidation.update,
  equipmentController.update
);
router.delete("/:id", isFarmAdmin, equipmentController.remove);
router.get("/:id", isFarmAdmin, equipmentController.find);

module.exports = router;
