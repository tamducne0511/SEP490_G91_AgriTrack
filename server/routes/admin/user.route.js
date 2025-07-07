const express = require("express");
const router = express.Router();

const userController = require("../../controllers/admin/user.controller");
const userValidation = require("../../middlewares/validators/user.validation");
const { isAdmin, isFarmAdmin, isRoles } = require("../../middlewares");
const { USER_ROLE } = require("../../constants/app");

router.get("/", isAdmin, userController.getList);
router.post("/:id/active", isAdmin, userController.active);
router.post("/:id/deactive", isAdmin, userController.deactive);
router.get("/list/farmers", isFarmAdmin, userController.getListFarmer);
router.get(
  "/:id",
  isRoles(USER_ROLE.farmAdmin, USER_ROLE.admin),
  userController.getDetail
);
router.post("/", userValidation.create, userController.create);
router.post(
  "/farmers",
  isFarmAdmin,
  userValidation.createFarmer,
  userController.createFarmer
);
router.delete("/farmers/:id", isFarmAdmin, userController.removeFarmer);
router.get(
  "/list/farm-unassigned",
  isAdmin,
  userController.getListFarmUnassigned
);
router.post(
  "/farm/assign",
  isAdmin,
  userValidation.assignFarmToUser,
  userController.assignFarmToUser
);
router.delete("/:id", isAdmin, userController.remove);
router.post(
  "/assign/expert-to-farm",
  isAdmin,
  userValidation.assignExpertToFarm,
  userController.assignExpertToFarm
);
router.get(
  "/assign/expert-to-farm/:expertId",
  isRoles([USER_ROLE.expert, USER_ROLE.admin]),
  userController.getListFarmAssignToExpert
);
router.delete(
  "/unassign/expert-to-farm/:id",
  isAdmin,
  userController.removeAssignExpertToFarm
);

module.exports = router;
