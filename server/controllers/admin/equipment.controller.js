// Controller cho module thiết bị (Equipment) phía Admin/FarmAdmin
// - Nhận request, gọi service, trả response với format thống nhất
// - Xử lý validate lỗi đầu vào dựa vào express-validator
const { validationResult } = require("express-validator");
const { formatPagination } = require("../../utils/format.util");
const equipmentService = require("../../services/equipment.service");
const NotFoundException = require("../../middlewares/exceptions/notfound");

// Lấy danh sách thiết bị có phân trang + tìm kiếm theo từ khóa
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

// Tạo mới thiết bị
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

  // Gọi service tạo thiết bị
  const equipment = await equipmentService.create(payload);
  res.status(201).json({
    message: "Equipment created successfully",
    data: equipment,
  });
};

// Cập nhật thiết bị theo id
const update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    // Gọi service cập nhật
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

// Xóa mềm thiết bị (status=false)
const remove = async (req, res, next) => {
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

// Lấy chi tiết thiết bị
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
