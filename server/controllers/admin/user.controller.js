const { validationResult } = require("express-validator");
const { formatPagination } = require("../../utils/format.util");
const userService = require("../../services/user.service");
const farmService = require("../../services/farm.service");
const { hashPassword } = require("../../utils/auth.util");
const { USER_ROLE } = require("../../constants/app");
const NotFoundException = require("../../middlewares/exceptions/notfound");
const BadRequestException = require("../../middlewares/exceptions/badrequest");

// Get list user with pagination and keyword search
const getList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";
  const role = req.query.role;
  const list = await userService.getListPagination(role, page, keyword);
  const total = await userService.getTotal(role, keyword);
  res.json(formatPagination(page, total, list));
};

// Get list farmer in farm
const getListFarmer = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";
  const selectedFarmId = req.query.farmId; // nhận farmId từ frontend
  
  let farmIdsToQuery;

  if (req.user.role === "expert") {
    // Expert có thể chọn farm, nếu không chọn thì lấy tất cả farm của expert
    farmIdsToQuery = selectedFarmId
      ? [selectedFarmId] // fetch theo farm được chọn
      : req.user.farmId.map(f => f); // fetch tất cả farm của expert
  } else {
    // Farm-admin chỉ có 1 farm
    farmIdsToQuery = [req.user.farmId];
  }

  const list = await userService.getListFarmerInFarm(farmIdsToQuery, page, keyword);
  const total = await userService.getTotalFarmerInFarm(farmIdsToQuery, keyword);
  res.json(formatPagination(page, total, list));
};

// Create new farmer in farm
const createFarmer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const payload = {
    fullName: req.body.fullName,
    email: req.body.email,
    password: await hashPassword(req.body.password),
    farmId: req.user.role === "expert" ? req.body.farmId : req.user.farmId,
    role: USER_ROLE.farmer,
  };

  const user = await userService.create(payload);
  res.status(201).json({
    message: "User created successfully",
    data: user,
  });
};

// Get list farm unassigned to user
const getListFarmUnassigned = async (req, res) => {
  const list = await farmService.getListFarmUnassigned();
  res.json({
    message: "Get list farm successfully",
    data: list,
  });
};

// Assign farm to user
const assignFarmToUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  await userService.assignFarmToUser(req.body.userId, req.body.farmId);
  res.json({
    message: "Farm assigned to user successfully",
  });
};

// Create new user
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const payload = {
    fullName: req.body.fullName,
    email: req.body.email,
    password: await hashPassword(req.body.password),
    role: req.body.role || "farmer",
  };

  const user = await userService.create(payload);
  res.status(201).json({
    message: "User created successfully",
    data: user,
  });
};

// Delete user
const remove = async (req, res) => {
  const id = req.params.id;
  const user = await userService.find(id);
  if (!user) {
    next(new NotFoundException("Not found user with id: " + id));
  }

  await userService.remove(id);
  res.json({
    message: "User deleted successfully",
  });
};

// Delete farmer
const removeFarmer = async (req, res, next) => {
  const id = req.params.id;
  const user = await userService.find(id);
  if (!user) {
    return next(new NotFoundException("Not found user with id: " + id));
  }

  if (user.role !== USER_ROLE.farmer) {
    return next(new BadRequestException("User is not a farmer"));
  }

  // Chuyên gia không được phép xóa nông dân
  if (req.user.role === USER_ROLE.expert) {
    return next(new BadRequestException("Chuyên gia không có quyền xóa nông dân"));
  }

  // Chỉ farm-admin mới được xóa nông dân của farm mình
  if (req.user.role === USER_ROLE.farmAdmin) {
    if (user.farmId.toString() !== req.user.farmId) {
      return next(new NotFoundException("Farmer not found in your farm"));
    }
  }
  await userService.remove(id);
  res.json({
    message: "Farmer deleted successfully",
  });
};

// Get detail user
const getDetail = async (req, res, next) => {
  const id = req.params.id;
  const user = await userService.getDetail(id);
  res.json({
    message: "Get user detail successfully",
    data: user,
  });
};

// Assign expert to farm
const assignExpertToFarm = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const payload = {
    farmId: req.body.farmId,
    expertId: req.body.expertId,
  };

  const user = await userService.assignExpertToFarm(payload);
  res.status(201).json({
    message: "Assign expert to farm successfully",
    data: user,
  });
};

// Remove assign export to farm
const removeAssignExpertToFarm = async (req, res, next) => {
  const id = req.params.id;
  const user = await userService.removeAssignExpertToFarm(id);
  res.status(201).json({
    message: "Remove assign expert to farm successfully",
    data: user,
  });
};

// Get list farm assign to expert
const getListFarmAssignToExpert = async (req, res, next) => {
  const expertId = req.params.expertId;
  const list = await userService.getListFarmAssignToExpert(expertId);
  res.json({
    list,
    message: "Get list farm assign to expert successfully",
  });
};

const active = async (req, res) => {
  const id = req.params.id;
  const user = await userService.changeStatus(id, true);
  res.json({
    user,
    message: "Active user successfully",
  });
};

const deactive = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await userService.changeStatus(id, false);

    if (!user) {
      return next(new NotFoundException("Not found user with id: " + id));
    }

    res.json({
      user,
      message: "Deactive user successfully and email sent",
    });
  } catch (err) {
    next(err);
  }
};

// Admin change password for expert/farm-admin
const adminChangePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const targetUser = await userService.find(id);
    if (!targetUser) {
      return next(new NotFoundException("Not found user with id: " + id));
    }

    if (![USER_ROLE.farmAdmin, USER_ROLE.expert, USER_ROLE.farmer].includes(targetUser.role)) {
      return next(
        new BadRequestException(
          "Only 'farm-admin' and 'expert' passwords can be reset by admin or farm-admin for farmer"
        )
      );
    }

    await userService.updatePassword(id, newPassword);
    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getList,
  create,
  remove,
  getListFarmUnassigned,
  assignFarmToUser,
  getListFarmer,
  createFarmer,
  removeFarmer,
  getDetail,
  assignExpertToFarm,
  removeAssignExpertToFarm,
  getListFarmAssignToExpert,
  active,
  deactive,
  adminChangePassword,
};