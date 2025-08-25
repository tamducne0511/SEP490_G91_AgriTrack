const { validationResult } = require("express-validator");
const { formatPagination } = require("../../utils/format.util");
const equipmentChangeService = require("../../services/equipmentChange.service");
const { EQUIPMENT_CHANGE_STATUS } = require("../../constants/app");
const NotFoundException = require("../../middlewares/exceptions/notfound");

// Get list equipment change with pagination and keyword search
const getList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const status = req.query.status || "all";
  const farmId = req.user.farmId;
  const list = await equipmentChangeService.getListPagination(
    farmId,
    status,
    page
  );
  const total = await equipmentChangeService.getTotal(farmId, status);
  res.json(formatPagination(page, total, list));
};

// Create new equipment change
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const payload = {
    farmId: req.user.farmId,
    equipmentId: req.body.equipmentId,
    type: req.body.type,
    quantity: req.body.quantity,
    price: req.body.price,
    createdBy: req.user.id,
  };

  const equipmentChange = await equipmentChangeService.create(payload);
  res.status(201).json({
    message: "Equipment change created successfully",
    data: equipmentChange,
  });
};

// Get detail
const find = async (req, res, next) => {
  const id = req.params.id;
  const equipmentCategory = await equipmentChangeService.find(id);
  if (!equipmentCategory) {
    return next(new NotFoundException("Not found category with id: " + id));
  }
  res.json({
    message: "Category found successfully",
    data: equipmentCategory,
  });
};

// Approve equipment change
const approve = async (req, res, next) => {
  const id = req.params.id;
  const equipmentCategory = await equipmentChangeService.find(id);
  if (
    !equipmentCategory ||
    equipmentCategory.status !== EQUIPMENT_CHANGE_STATUS.pending
  ) {
    return next(new NotFoundException("Not found category with id: " + id));
  }

  const equipmentChange = await equipmentChangeService.approve(id, req.user.id);
  res.json({
    message: "Equipment change approved successfully",
    data: equipmentChange,
  });
};

// Reject equipment change
const reject = async (req, res, next) => {
  const id = req.params.id;
  const equipmentCategory = await equipmentChangeService.find(id);
  if (
    !equipmentCategory ||
    equipmentCategory.status !== EQUIPMENT_CHANGE_STATUS.pending
  ) {
    return next(new NotFoundException("Not found category with id: " + id));
  }

  const equipmentChange = await equipmentChangeService.reject(
    id,
    req.body.reason,
    req.user.id
  );
  res.json({
    message: "Equipment change rejected successfully",
    data: equipmentChange,
  });
};

module.exports = {
  getList,
  create,
  find,
  approve,
  reject,
};
