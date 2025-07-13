const express = require("express");
const router = express.Router();

const treeController = require("../../controllers/admin/tree.controller");
const { isFarmAdmin, isRoles } = require("../../middlewares");
const { USER_ROLE } = require("../../constants/app");

router.post("/generate/:gardenId", isFarmAdmin, treeController.generateTree);
router.get(
  "/list/:gardenId",
  isRoles([USER_ROLE.admin, USER_ROLE.expert, USER_ROLE.farmAdmin]),
  treeController.getList
);

module.exports = router;