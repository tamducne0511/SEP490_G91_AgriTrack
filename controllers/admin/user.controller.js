const { validationResult } = require("express-validator");
const { formatPagination } = require("../../utils/format.util");
const userService = require("../../services/user.service");
const farmService = require("../../services/farm.service");
const { hashPassword } = require("../../utils/auth.util");

// Get list user with pagination and keyword search
const getList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";
  const role = req.query.role || "farmer";
  const list = await userService.getListPagination(role, page, keyword);
  const total = await userService.getTotal(role, keyword);
  res.json(formatPagination(page, total, list));
};

// Assign farm
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

module.exports = {
  getList,
  create,
  remove,
  assignFarmToUser
};
