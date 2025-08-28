const express = require("express");
const router = express.Router();
const multer = require("multer");

const gardenValidation = require("../../middlewares/validators/garden.validation");
const gardenController = require("../../controllers/admin/garden.controller");
const { configUploadFile, fileFilter } = require("../../utils/upload.util");
const { isFarmAdmin, isRoles } = require("../../middlewares");
const { USER_ROLE } = require("../../constants/app");
const upload = multer({
  storage: configUploadFile("uploads/gardens"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get(
  "/",
  isRoles([USER_ROLE.farmAdmin, USER_ROLE.farmer, USER_ROLE.expert]),
  gardenController.getList
);
router.get(
  "/farm/:farmId",
  isRoles([USER_ROLE.farmAdmin, USER_ROLE.farmer, USER_ROLE.expert]),
  gardenController.getListByFarmId
);
router.post(
  "/",
  isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]),
  upload.single("image"),
  gardenValidation.create,
  gardenController.create
);
router.put(
  "/:id",
  isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]),
  upload.single("image"),
  gardenValidation.update,
  gardenController.update
);
router.delete("/:id", isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]), gardenController.remove);
router.get("/:id", isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]), gardenController.find);

module.exports = router;
