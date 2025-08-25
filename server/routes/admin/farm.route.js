const express = require("express");
const router = express.Router();
const multer = require("multer");

const farmValidation = require("../../middlewares/validators/farm.validation");
const farmController = require("../../controllers/admin/farm.controller");
const { configUploadFile, fileFilter } = require("../../utils/upload.util");
const { isAdmin } = require("../../middlewares");
const upload = multer({
  storage: configUploadFile("uploads/farms"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", isAdmin, farmController.getList);
router.post(
  "/",
  isAdmin,
  upload.single("image"),
  farmValidation.create,
  farmController.create
);
router.put(
  "/:id",
  isAdmin,
  upload.single("image"),
  farmValidation.update,
  farmController.update
);
router.delete("/:id", isAdmin, farmController.remove);
router.get("/:id", isAdmin, farmController.find);

module.exports = router;