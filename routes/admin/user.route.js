const express = require("express");
const router = express.Router();

const userController = require("../../controllers/admin/user.controller");
const userValidation = require("../../middlewares/validators/user.validation");
const { isAdmin } = require("../../middlewares");

router.get("/", isAdmin, userController.getList);
router.post("/", userValidation.create, userController.create);
router.get(
  "/list-farm-unassigned",
  isAdmin,
  userController.getListFarmUnassigned
);
router.post(
  "/farm/assign",
  isAdmin,
  userValidation.assignFarmToUser,
  userController.assignFarmToUser
);
router.delete("/:id", isAdmin, userValidation.create, userController.remove);

module.exports = router;
