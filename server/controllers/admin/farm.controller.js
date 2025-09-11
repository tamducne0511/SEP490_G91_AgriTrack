const { validationResult } = require("express-validator");
const { formatPagination } = require("../../utils/format.util");
const farmService = require("../../services/farm.service");
const NotFoundException = require("../../middlewares/exceptions/notfound");

// Get list farm with pagination and keyword search
const getList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const keyword = req.query.keyword || "";
  
  // Nếu pageSize >= 1000, lấy tất cả farms
  if (pageSize >= 1000) {
    const list = await farmService.getListPagination(1, keyword, pageSize);
    const total = await farmService.getTotal(keyword);
    res.json({
      message: "Farms fetched successfully",
      data: list,
      totalItem: total,
      page: 1,
      pageSize: total,
    });
  } else {
    const list = await farmService.getListPagination(page, keyword, pageSize);
    const total = await farmService.getTotal(keyword);
    res.json(formatPagination(page, total, list));
  }
};

// Create new farm
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const payload = {
    name: req.body.name,
    description: req.body.description,
    address: req.body.address,
    image: req.file?.filename ? `/uploads/farms/${req.file.filename}` : "",
  };

  const farm = await farmService.create(payload);
  res.status(201).json({
    message: "Farm created successfully",
    data: farm,
  });
};

// Update existed farm
const update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const farm = await farmService.update(id, {
      name: req.body.name,
      description: req.body.description,
      address: req.body.address,
      image: req.file?.filename ? `/uploads/farms/${req.file.filename}` : "",
    });

    res.json({
      message: "Farm updated successfully",
      data: farm,
    });
  } catch (error) {
    next(error);
  }
};

// Delete farm
const remove = async (req, res) => {
  const id = req.params.id;
  const farm = await farmService.find(id);
  if (!farm) {
    next(new NotFoundException("Not found farm with id: " + id));
  }

  await farmService.remove(id);
  res.json({
    message: "Farm deleted successfully",
  });
};

// Get detail
const find = async (req, res, next) => {
  const id = req.params.id;
  const farm = await farmService.getDetail(id);
  if (!farm) {
    return next(new NotFoundException("Not found farm with id: " + id));
  }
  res.json({
    message: "Category found successfully",
    data: farm,
  });
};

module.exports = {
  getList,
  create,
  update,
  remove,
  find,
};
