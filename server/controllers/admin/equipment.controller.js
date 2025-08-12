const { validationResult } = require("express-validator");
const { formatPagination } = require("../../utils/format.util");
const equipmentService = require("../../services/equipment.service");
const NotFoundException = require("../../middlewares/exceptions/notfound");

// Get list equipment with pagination and keyword search
const getList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";
  const category = req.query.category || null;
  const farmId = req.user.farmId;
  const status = req.query.status || null;
  const list = await equipmentService.getListPagination(
    farmId,
    category,
    page,
    keyword,
    status
  );
  const total = await equipmentService.getTotal(
    farmId,
    category,
    keyword,
    status
  );
  res.json(formatPagination(page, total, list));
};

// Create new equipment
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const payload = {
    name: req.body.name,
    description: req.body.description,
    farmId: req.user.farmId,
    categoryId: req.body.categoryId,
    image: req.file?.filename ? `/uploads/equipments/${req.file.filename}` : "",
  };

  const equipment = await equipmentService.create(payload);
  res.status(201).json({
    message: "Equipment created successfully",
    data: equipment,
  });
};

// Update existed equipment
const update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const equipment = await equipmentService.update(id, {
      name: req.body.name,
      description: req.body.description,
      categoryId: req.body.categoryId,
      image: req.file?.filename
        ? `/uploads/equipments/${req.file.filename}`
        : "",
    });

    res.json({
      message: "Equipment updated successfully",
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

// Delete equipment
const remove = async (req, res) => {
  const id = req.params.id;
  const equipment = await equipmentService.find(id);
  if (!equipment) {
    next(new NotFoundException("Not found equipment with id: " + id));
  }

  await equipmentService.remove(id);
  res.json({
    message: "Equipment deleted successfully",
  });
};

// Get detail
const find = async (req, res, next) => {
  const id = req.params.id;
  const equipment = await equipmentService.find(id);
  if (!equipment) {
    return next(new NotFoundException("Not found equipment with id: " + id));
  }
  res.json({
    message: "Equipment found successfully",
    data: equipment,
  });
};

module.exports = {
  getList,
  create,
  update,
  remove,
  find,
};
