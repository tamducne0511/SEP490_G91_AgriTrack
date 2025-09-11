const express = require("express");
const router = express.Router();

const treeController = require("../../controllers/admin/tree.controller");
const { isFarmAdmin, isRoles, isLogin } = require("../../middlewares");
const { USER_ROLE } = require("../../constants/app");

/**
 * Yêu cầu quyền farmAdmin. Tạo cácd cây cho vườn theo body { row, col }.
 */
router.post("/generate/:gardenId", isFarmAdmin, treeController.generateTree);
router.get(
  "/list/:gardenId",
  isRoles([
    USER_ROLE.admin,
    USER_ROLE.expert,
    USER_ROLE.farmAdmin,
    USER_ROLE.farmer,
  ]),
  treeController.getList
);
router.get("/:id", isLogin, treeController.getDetail);

module.exports = router;
