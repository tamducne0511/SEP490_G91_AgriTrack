// Import hàm lấy ra lỗi từ express-validator để kiểm tra dữ liệu đầu vào
const { validationResult } = require("express-validator");
const { formatPagination } = require("../utils/format.util");
const farmScheduleService = require("../services/farmSchedule.service");
const e = require("cors");
const NotFoundException = require("../middlewares/exceptions/notfound");

// Lấy danh sách lịch nông trại có phân trang và tìm kiếm 
const getList = async (req, res) => {
  // Lấy trang hiện tại từ query, mặc định là 1 nếu không có
  const page = parseInt(req.query.page) || 1;
  // Lấy từ khóa tìm kiếm, mặc định chuỗi rỗng
  const keyword = req.query.keyword || "";
  // Gọi service để lấy danh sách theo trang + từ khóa, theo farmId
  const list = await farmScheduleService.getListPagination(
    req.query.farmId,
    page,
    keyword
  );
  // Gọi service để lấy tổng số bản ghi phục vụ phân trang
  const total = await farmScheduleService.getTotal(req.query.farmId, keyword);
  res.json(formatPagination(page, total, list));
};

// Tạo mới một lịch nông vụ
const create = async (req, res) => {
  // Lấy kết quả validate từ express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Tạo payload từ body và file upload nếu có
  const payload = {
    title: req.body.title,
    description: req.body.description,
    startAt: req.body.startAt,
    endAt: req.body.endAt,
    farmId: req.body.farmId,
    treeName: req.body.treeName,
    treeDescription: req.body.treeDescription,
    image: req.file?.filename ? `/uploads/schedules/${req.file.filename}` : "",
  };

  // Gọi service tạo mới, gán người tạo từ req.user.id
  const farmSchedule = await farmScheduleService.create(req.user.id, payload);
  res.status(201).json({
    message: "Farm Schedule created successfully",
    data: farmSchedule,
  });
};

// Cập nhật lịch nông trại đã tồn tại
const update = async (req, res, next) => {
  // Kiểm tra lỗi validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Lấy id lịch cần cập nhật từ params
    const id = req.params.id;
    // Gọi service update với dữ liệu từ body và file upload nếu có
    const farmSchedule = await farmScheduleService.update(id, {
      title: req.body.title,
      description: req.body.description,
      startAt: req.body.startAt,
      endAt: req.body.endAt,
      treeName: req.body.treeName,
      treeDescription: req.body.treeDescription,
      image: req.file?.filename
        ? `/uploads/schedules/${req.file.filename}`
        : "",
    });

    res.json({
      message: "Schedule updated successfully",
      data: farmSchedule,
    });
  } catch (error) {
    next(error);
  }
};

// Xóa (mềm) lịch nông trại
const remove = async (req, res, next) => {
  // Lấy id lịch từ params
  const id = req.params.id;
  // Tìm lịch theo id để kiểm tra tồn tại
  const farmSchedule = await farmScheduleService.find(id);
  if (!farmSchedule) {
    return next(new NotFoundException("Not found schedule with id: " + id));
  }

  // Gọi service xóa mềm status=false
  await farmScheduleService.remove(id);
  res.json({
    message: "Schedule deleted successfully",
  });
};

// Lấy chi tiết một lịch nông trại theo id
const find = async (req, res, next) => {
  // Lấy id từ params
  const id = req.params.id;
  // Gọi service tìm lịch
  const farmSchedule = await farmScheduleService.find(id);
  if (!farmSchedule) {
    // Không tìm thấy thì trả về NotFound
    return next(new NotFoundException("Not found schedule with id: " + id));
  }
  res.json({
    message: "Schedule found successfully",
    data: farmSchedule,
  });
};
const generateTasks = async (req, res, next) => {
  try {
    const { scheduleId } = req.body;

    const farmSchedule = await farmScheduleService.find(scheduleId);
    if (!farmSchedule) {
      return res.status(404).json({ message: "FarmSchedule not found" });
    }

    const tasks = await farmScheduleService.generateTasksFromSchedule(farmSchedule);

    res.status(201).json({
      message: "Tasks generated successfully from FarmSchedule description",
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  getList,
  create,
  update,
  remove,
  find,
  generateTasks,
};
