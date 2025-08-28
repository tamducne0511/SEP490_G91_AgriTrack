const { validationResult } = require("express-validator");
const { formatPagination } = require("../../utils/format.util");
const equipmentCategoryService = require("../../services/equipmentCategory.service");
const NotFoundException = require("../../middlewares/exceptions/notfound");

// Get list category with pagination and keyword search
const getList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const keyword = req.query.keyword || "";
  const farmId = req.user.farmId;
  
  // Nếu pageSize >= 1000, lấy tất cả categories
  if (pageSize >= 1000) {
    const list = await equipmentCategoryService.getListPagination(
      farmId,
      1,
      keyword,
      pageSize
    );
    const total = await equipmentCategoryService.getTotal(farmId, keyword);
    res.json({
      message: "Categories fetched successfully",
      data: list,
      totalItem: total,
      page: 1,
      pageSize: total,
    });
  } else {
    const list = await equipmentCategoryService.getListPagination(
      farmId,
      page,
      keyword,
      pageSize
    );
    const total = await equipmentCategoryService.getTotal(farmId, keyword);
    res.json(formatPagination(page, total, list));
  }
};

// Create new category
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const payload = {
    name: req.body.name,
    description: req.body.description,
    farmId: req.user.farmId,
    image: req.file?.filename ? `/uploads/categories/${req.file.filename}` : "",
  };

  const equipmentCategory = await equipmentCategoryService.create(payload);
  res.status(201).json({
    message: "Category created successfully",
    data: equipmentCategory,
  });
};

// Update existed category
const update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const equipmentCategory = await equipmentCategoryService.update(id, {
      name: req.body.name,
      description: req.body.description,
      image: req.file?.filename
        ? `/uploads/categories/${req.file.filename}`
        : "",
    });

    res.json({
      message: "Category updated successfully",
      data: equipmentCategory,
    });
  } catch (error) {
    next(error);
  }
};

// Delete category
const remove = async (req, res) => {
  const id = req.params.id;
  const equipmentCategory = await equipmentCategoryService.find(id);
  if (!equipmentCategory) {
    next(new NotFoundException("Not found category with id: " + id));
  }

  await equipmentCategoryService.remove(id);
  res.json({
    message: "Category deleted successfully",
  });
};

// Get detail
const find = async (req, res, next) => {
  const id = req.params.id;
  const equipmentCategory = await equipmentCategoryService.find(id);
  if (!equipmentCategory) {
    return next(new NotFoundException("Not found category with id: " + id));
  }
  res.json({
    message: "Category found successfully",
    data: equipmentCategory,
  });
};

module.exports = {
  getList,
  create,
  update,
  remove,
  find,
};
