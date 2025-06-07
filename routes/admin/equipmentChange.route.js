const express = require("express");
const router = express.Router();

const equipmentChangeValidation = require("../../middlewares/validators/equipmentChange.validation");
const equipmentChangeController = require("../../controllers/admin/equipmentChange.controller");
const { isFarmAdmin } = require("../../middlewares");

router.get("/", isFarmAdmin, equipmentChangeController.getList);
router.post(
  "/",
  isFarmAdmin,
  equipmentChangeValidation.create,
  equipmentChangeController.create
);
router.get("/:id", isFarmAdmin, equipmentChangeController.find);
router.get("/:id/approve", isFarmAdmin, equipmentChangeController.approve);
router.post("/:id/reject", isFarmAdmin, equipmentChangeController.reject);

module.exports = router;
