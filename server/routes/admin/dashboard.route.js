const express = require("express");
const router = express.Router();

const { isAdmin } = require("../../middlewares");
const dashboardController = require("../../controllers/admin/dashboard.controller");

router.get("/", isAdmin, dashboardController.getSummary);
router.get("/harvest", isAdmin, dashboardController.getHarvest);
router.get("/consumption", isAdmin, dashboardController.getConsumption);

module.exports = router;
