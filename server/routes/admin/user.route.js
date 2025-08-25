const express = require("express");
const router = express.Router();

const userController = require("../../controllers/admin/user.controller");
const userValidation = require("../../middlewares/validators/user.validation");
const { isAdmin, isFarmAdmin, isRoles } = require("../../middlewares");
const { USER_ROLE } = require("../../constants/app");

router.get("/", isAdmin, userController.getList);
router.post("/:id/active", isAdmin, userController.active);
router.post("/:id/deactive", isAdmin, userController.deactive);
router.get("/list/farmers", isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]), userController.getListFarmer);
router.get(
  "/:id",
  isRoles([USER_ROLE.farmAdmin, USER_ROLE.admin, USER_ROLE.expert]),
  userController.getDetail
);
router.post("/", userValidation.create, userController.create);
router.post(
  "/farmers",
  isRoles([USER_ROLE.farmAdmin, USER_ROLE.admin, USER_ROLE.expert]),
  userValidation.createFarmer,
  userController.createFarmer
);
router.delete("/farmers/:id", isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]), userController.removeFarmer);
router.post("/farmer/:id/active", isRoles([USER_ROLE.farmAdmin, USER_ROLE.expert]), userController.active);
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

// Admin change password for expert/farm-admin
router.post(
  "/:id/change-password",
  isRoles([USER_ROLE.farmAdmin, USER_ROLE.admin]),
  userValidation.adminChangePassword,
  userController.adminChangePassword
);

module.exports = router;
