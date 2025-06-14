const { validationResult } = require("express-validator");
const { formatPagination } = require("../../utils/format.util");
const userService = require("../../services/user.service");
const farmService = require("../../services/farm.service");
const { hashPassword } = require("../../utils/auth.util");
const { USER_ROLE } = require("../../constants/app");

// Get list user with pagination and keyword search
const getList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";
  const role = req.query.role || "farmer";
  const list = await userService.getListPagination(role, page, keyword);
  const total = await userService.getTotal(role, keyword);
  res.json(formatPagination(page, total, list));
};

// Get list farmer in farm
const getListFarmer = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";
  const list = await userService.getListFarmerInFarm(
    req.user.farmId,
    page,
    keyword
  );
  const total = await userService.getTotalFarmerInFarm(
    req.user.farmId,
    keyword
  );
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
    farmId: req.user.farmId,
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
  if (!user || user.farmId !== req.user.farmId) {
    return next(new NotFoundException("Not found user with id: " + id));
  }

  if (user.role !== USER_ROLE.farmer) {
    return next(new BadRequestException("User is not a farmer"));
  }

  await userService.remove(id);
  res.json({
    message: "Farmer deleted successfully",
  });
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
};