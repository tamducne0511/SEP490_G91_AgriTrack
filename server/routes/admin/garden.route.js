const express = require("express");
const router = express.Router();
const multer = require("multer");

const gardenValidation = require("../../middlewares/validators/garden.validation");
const gardenController = require("../../controllers/admin/garden.controller");
const { configUploadFile } = require("../../utils/upload.util");
const { isFarmAdmin } = require("../../middlewares");
const upload = multer({ storage: configUploadFile("uploads/gardens") });

router.get("/", isFarmAdmin, gardenController.getList);
router.post(
  "/",
  isFarmAdmin,
  upload.single("image"),
  gardenValidation.create,
  gardenController.create
);
router.put(
  "/:id",
  isFarmAdmin,
  upload.single("image"),
  gardenValidation.update,
  gardenController.update
);
router.delete("/:id", isFarmAdmin, gardenController.remove);
router.get("/:id", isFarmAdmin, gardenController.find);

module.exports = router;