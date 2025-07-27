const express = require("express");
const router = express.Router();

const equipmentController = require("../../controllers/admin/equipment.controller");
const { isFarmer } = require("../../middlewares");

router.get("/", isFarmer, equipmentController.getList);
router.get("/:id", isFarmer, equipmentController.find);

module.exports = router;
