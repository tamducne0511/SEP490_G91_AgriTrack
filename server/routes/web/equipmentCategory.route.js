const express = require("express");
const router = express.Router();

const equipmentCategoryController = require("../../controllers/admin/equipmentCategory.controller");
const { isFarmer } = require("../../middlewares");

router.get("/", isFarmer, equipmentCategoryController.getList);
router.get("/:id", isFarmer, equipmentCategoryController.find);

module.exports = router;
