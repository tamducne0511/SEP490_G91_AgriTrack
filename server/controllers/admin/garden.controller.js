const { validationResult } = require("express-validator");
const { formatPagination } = require("../../utils/format.util");
const gardenService = require("../../services/garden.service");
const NotFoundException = require("../../middlewares/exceptions/notfound");

// Get list garden with pagination and keyword search
const getList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const keyword = req.query.keyword || "";
  
  // Nếu pageSize >= 1000, lấy tất cả gardens
  if (pageSize >= 1000) {
    const list = await gardenService.getListPagination(
      req.user.farmId,
      1,
      keyword,
      pageSize
    );
    const total = await gardenService.getTotal(req.user.farmId, keyword);
    res.json({
      message: "Gardens fetched successfully",
      data: list,
      totalItem: total,
      page: 1,
      pageSize: total,
    });
  } else {
    const list = await gardenService.getListPagination(
      req.user.farmId,
      page,
      keyword,
      pageSize
    );
    const total = await gardenService.getTotal(req.user.farmId, keyword);
    res.json(formatPagination(page, total, list));
  }
};

// Get list garden of farm with pagination and keyword search
const getListByFarmId = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const keyword = req.query.keyword || "";
  
  // Nếu pageSize >= 1000, lấy tất cả gardens của farm
  if (pageSize >= 1000) {
    const list = await gardenService.getListPagination(
      req.params.farmId,
      1,
      keyword,
      pageSize
    );
    const total = await gardenService.getTotal(req.params.farmId, keyword);
    res.json({
      message: "Gardens fetched successfully",
      data: list,
      totalItem: total,
      page: 1,
      pageSize: total,
    });
  } else {
    const list = await gardenService.getListPagination(
      req.params.farmId,
      page,
      keyword,
      pageSize
    );
    const total = await gardenService.getTotal(req.params.farmId, keyword);
    res.json(formatPagination(page, total, list));
  }
};

// Create new garden
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const payload = {
    name: req.body.name,
    description: req.body.description,
    farmId: req.user.farmId,
    image: req.file?.filename ? `/uploads/gardens/${req.file.filename}` : "",
  };

  const garden = await gardenService.create(payload);
  res.status(201).json({
    message: "Garden created successfully",
    data: garden,
  });
};

// Update existed garden
const update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const garden = await gardenService.update(id, {
      name: req.body.name,
      description: req.body.description,
      image: req.file?.filename ? `/uploads/gardens/${req.file.filename}` : "",
    });

    res.json({
      message: "garden updated successfully",
      data: garden,
    });
  } catch (error) {
    next(error);
  }
};

// Delete garden
const remove = async (req, res) => {
  const id = req.params.id;
  const garden = await gardenService.find(id);
  if (!garden) {
    next(new NotFoundException("Not found garden with id: " + id));
  }

  await gardenService.remove(id);
  res.json({
    message: "Garden deleted successfully",
  });
};

// Get detail
const find = async (req, res, next) => {
  const id = req.params.id;
  const garden = await gardenService.getDetail(id);
  if (!garden) {
    return next(new NotFoundException("Not found garden with id: " + id));
  }
  res.json({
    message: "Garden found successfully",
    data: garden,
  });
};

module.exports = {
  getList,
  create,
  update,
  remove,
  find,
  getListByFarmId,
};
