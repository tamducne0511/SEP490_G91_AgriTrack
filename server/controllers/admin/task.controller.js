const { validationResult } = require("express-validator");
const { formatPagination } = require("../../utils/format.util");
const taskService = require("../../services/task.service");
const notificationService = require("../../services/notification.service");
const userService = require("../../services/user.service");
const NotFoundException = require("../../middlewares/exceptions/notfound");
const ExcelJS = require('exceljs');

// Get list task with pagination and keyword search
const getList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const keyword = req.query.keyword || "";
  const gardenId = req.query.gardenId || null;
  const farmId = req.user.role === "expert" ? (req.query.farmId || null) : req.user.farmId;
  const list = await taskService.getListPagination(
    farmId,
    gardenId,
    page,
    keyword,
    pageSize
  );

  if (pageSize >= 1000) {
    res.json({
      data: list,
      totalItem: list.length,
      page: 1,
      pageSize: list.length,
    });
  } else {
    const total = await taskService.getTotal(farmId, gardenId, keyword);
    res.json(formatPagination(page, total, list));
  }
};

// Create new task
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Xử lý farmId cho expert
  let farmId;
  if (req.user.role === "expert") {
    farmId = req.body.farmId; // Expert sẽ gửi farmId cụ thể
  } else {
    farmId = req.user.farmId; // Farm-admin chỉ có 1 farm
  }

  const payload = {
    name: req.body.name,
    description: req.body.description,
    type: req.body.type,
    priority: req.body.priority,
    farmId: req.user.role === "expert" ? req.body.farmId : req.user.farmId,
    gardenId: req.body.gardenId,
    image: req.file?.filename ? `/uploads/tasks/${req.file.filename}` : "",
    startDate: req.body.startDate !== "null" ? new Date(req.body.startDate) : null,
    endDate: req.body.endDate !== "null" ? new Date(req.body.endDate) : null,
    createdBy: req.user.id,
  };

  const task = await taskService.create(payload);
  res.status(201).json({
    message: "Task created successfully",
    data: task,
  });
};

// Update existed task
const update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const task = await taskService.update(id, {
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      priority: req.body.priority,
      gardenId: req.body.gardenId,
      image: req.file?.filename ? `/uploads/tasks/${req.file.filename}` : "",
      startDate: req.body.startDate ? new Date(req.body.startDate) : null,
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
    });

    res.json({
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Delete task
const remove = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const { deleteReason } = req.body;

    // Kiểm tra quyền - chỉ expert và farm-admin mới được xóa task
    if (req.user.role !== "expert" && req.user.role !== "farm-admin") {
      return res.status(403).json({
        message: "Chỉ chuyên gia và chủ trang trại mới có quyền xóa công việc"
      });
    }

    // Xóa task
    const task = await taskService.remove(id, req.user.id, deleteReason);

    // Lấy thông tin user xóa task
    const deletedByUser = await userService.find(req.user.id);

    // Tạo notification
    await notificationService.createTaskDeleteNotification(task, deleteReason, deletedByUser);

    res.json({
      message: "Task deleted successfully",
      data: task,
    });
  } catch (error) {
    return next(error);
  }
};

// Get detail
const find = async (req, res, next) => {
  const id = req.params.id;
  const task = await taskService.find(id);
  if (!task) {
    return next(new NotFoundException("Not found task with id: " + id));
  }
  res.json({
    message: "Task found successfully",
    data: task,
  });
};

// Assign farmer to task
const assignFarmer = async (req, res, next) => {
  const id = req.params.id;
  const farmerId = req.body.farmerId;
  const result = await taskService.assignFarmer(id, farmerId);
  res.json({
    message: "Assigned farmer to task successfully",
    data: result,
  });
};
const exportExcel = async (req, res, next) => {
  try {
    const { farmId, gardenId, keyword } = req.query;
    const tasks = await taskService.exportTask(farmId, gardenId, keyword || "");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tasks');
    worksheet.columns = [
      { header: "STT", key: "stt", width: 5 },
      { header: "Tên công việc", key: "name", width: 25 },
      { header: "Loại", key: "type", width: 15 },
      { header: "Ngày bắt đầu", key: "startDate", width: 15 },
      { header: "Ngày kết thúc", key: "endDate", width: 15 },
      { header: "Người tạo", key: "createdBy", width: 20 },
      { header: "Ưu tiên", key: "priority", width: 15 },
      { header: "Trạng thái", key: "status", width: 15 },
    ]
    tasks.forEach((t, i) => {
      worksheet.addRow({
        stt: i + 1,
        name: t.name,
        type: t.type,
        startDate: t.startDate ? t.startDate.toISOString().split("T")[0] : "",
        endDate: t.endDate ? t.endDate.toISOString().split("T")[0] : "",
        createdBy: t.createdBy ? t.createdBy.fullName : "",
        priority: t.priority,
        status: t.status,
      });
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "tasks.xlsx"
    );
    await workbook.xlsx.write(res);
    res.status(200).end();
  }
  catch (e) { 
    console.log(e);
    res.status(500).json({ message: "Lỗi xuất excel" });
   }
}

module.exports = {
  getList,
  create,
  update,
  remove,
  find,
  assignFarmer,
  exportExcel,
};