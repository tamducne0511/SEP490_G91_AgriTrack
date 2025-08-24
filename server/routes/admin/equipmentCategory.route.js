const express = require("express");
const router = express.Router();
const multer = require("multer");

const { configUploadFile } = require("../../utils/upload.util");
const upload = multer({ storage: configUploadFile("uploads/categories") });
const equipmentCategoryValidation = require("../../middlewares/validators/equipmentCategory.validation");
const equipmentCategoryController = require("../../controllers/admin/equipmentCategory.controller");
const { isFarmAdmin } = require("../../middlewares");

router.get("/", isFarmAdmin, equipmentCategoryController.getList);
router.post(
  "/",
  isFarmAdmin,
  upload.single("image"),
  equipmentCategoryValidation.create,
  equipmentCategoryController.create
);
router.put(
  "/:id",
  isFarmAdmin,
  upload.single("image"),
  equipmentCategoryValidation.update,
  equipmentCategoryController.update
);
router.delete("/:id", isFarmAdmin, equipmentCategoryController.remove);
router.get("/:id", isFarmAdmin, equipmentCategoryController.find);

module.exports = router;
