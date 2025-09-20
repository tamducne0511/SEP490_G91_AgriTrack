const Farm = require("../models/farm.model");
const Garden = require("../models/garden.model");
const Task = require("../models/task.model");
const User = require("../models/user.model");

const {
  LIMIT_ITEM_PER_PAGE,
  TASK_ASSIGN_STATUS,
  USER_ROLE,
} = require("../constants/app");
const NotFoundException = require("../middlewares/exceptions/notfound");
const TaskHistory = require("../models/taskHistory.model");
const TaskDailyNote = require("../models/taskDailyNote.model");
const BadRequestException = require("../middlewares/exceptions/badrequest");
const mongoose = require("mongoose");

const getListPagination = async (farmId, gardenId, page, keyword, pageSize = LIMIT_ITEM_PER_PAGE) => {
  const filter = {
    name: { $regex: keyword, $options: "i" },
  };

  // Xử lý farmId có thể là string hoặc mảng
  if (Array.isArray(farmId)) {
    if (farmId.length === 0) {
      return []; // Trả về mảng rỗng nếu không có farm nào
    }
    filter.farmId = { $in: farmId };
  } else {
    filter.farmId = farmId;
  }

  if (gardenId) {
    filter.gardenId = gardenId;
  }

  const list = await Task.find(filter)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate("createdBy", "fullName");
  return list;
};

const getListAssignedPagination = async (farmId, farmerId, page, keyword) => {
  const list = await Task.find({
    farmId: farmId,
    farmerId: farmerId,
    name: { $regex: keyword, $options: "i" },
  })
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  return list;
};

const getTotal = async (farmId, gardenId, keyword) => {
  const filter = {
    name: { $regex: keyword, $options: "i" },
  };

  if (farmId) {
    filter.farmId = farmId;
  }
  // Xử lý farmId có thể là string hoặc mảng
  if (Array.isArray(farmId)) {
    if (farmId.length === 0) {
      return 0; // Trả về 0 nếu không có farm nào
    }
    filter.farmId = { $in: farmId };
  } else {
    filter.farmId = farmId;
  }

  if (gardenId) {
    filter.gardenId = gardenId;
  }

  const total = await Task.countDocuments(filter);
  return total;
};

const getTotalAssigned = async (farmId, farmerId, keyword) => {
  const total = await Task.countDocuments({
    farmId: farmId,
    farmerId: farmerId,
    name: { $regex: keyword, $options: "i" },
  });

  return total;
};

const create = async (data) => {
  try {
    const farm = await Farm.findById(data.farmId);
    if (!farm) {
      throw new NotFoundException("Not found Farm with id: " + data.farmId);
    }

    const garden = await Garden.findById(data.gardenId);
    if (!garden) {
      throw new NotFoundException("Not found Garden with id: " + data.gardenId);
    }

    data.gardenId = garden._id;
    const task = new Task(data);
    await task.save();
    return task;
  } catch (error) {
    throw error;
  }
};

const update = async (id, data) => {
  const task = await find(id);
  if (!task) {
    throw new NotFoundException("Not found task with id: " + id);
  }

  const garden = await Garden.findById(data.gardenId);
  if (!garden) {
    throw new NotFoundException("Not found Garden with id: " + data.gardenId);
  }

  task.gardenId = garden._id;
  task.name = data.name;
  task.image = data.image || task.image;
  task.type = data.type;
  task.priority = data.priority;
  task.description = data.description;
  task.startDate = data.startDate;
  task.endDate = data.endDate;
  await task.save();
  return task;
};

const find = async (id) => {
  try {
    const task = await Task.findById(id).populate("farmerId", "-password").populate("createdBy", "fullName");
    return task;
  } catch (error) {
    return null;
  }
};

const getDetail = async (id) => {
  const task = await Task.findById(id);
  const listTaskHistory = await TaskHistory.aggregate([
    {
      $match: {
        taskId: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "farmerId",
        foreignField: "_id",
        as: "farmer",
      },
    },
    {
      $unwind: {
        path: "$farmer",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        "farmer.password": 0,
      },
    },
  ]);

  const listDailyNote = await TaskDailyNote.aggregate([
    {
      $match: {
        taskId: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "farmerId",
        foreignField: "_id",
        as: "farmer",
      },
    },
    {
      $unwind: {
        path: "$farmer",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        "farmer.password": 0,
      },
    },
  ]);

  const garden = await Garden.findById(task.gardenId);
  const farm = await Farm.findById(task.farmId);
  return { task, histories: listTaskHistory, notes: listDailyNote, garden, farm };
};

const remove = async (id, deletedBy, deleteReason) => {
  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundException("Not found task with id: " + id);
  }

  // Kiểm tra trạng thái task
  if (task.status === "completed") {
    throw new BadRequestException("Cannot delete a completed task.");
  }

  // Cập nhật task
  task.status = false; // Đánh dấu là đã xóa
  task.deleteReason = deleteReason;
  task.deletedBy = deletedBy;
  task.deletedAt = new Date();
  await task.save();

  // Tạo task history
  const taskHistory = new TaskHistory({
    taskId: id,
    farmerId: task.farmerId,
    comment: `Task deleted. Reason: ${deleteReason}`,
    status: "deleted",
  });

  await taskHistory.save();
  return task;
};

const assignFarmer = async (taskId, farmerId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundException("Not found task with id: " + taskId);
  }
  if (task.farmerId) {
    throw new BadRequestException("This task has already been assigned to a farmer.");
  }
  // Kiểm tra thêm trạng thái task
  if (task.status === TASK_ASSIGN_STATUS.completed) {
    throw new BadRequestException("Cannot assign a completed task.");
  }
  const user = await User.findById(farmerId);
  if (!user || user.role !== USER_ROLE.farmer) {
    throw new NotFoundException("Not found user with id: " + farmerId);
  }

  task.farmerId = farmerId;
  task.status = TASK_ASSIGN_STATUS.assigned;
  await task.save();

  const taskHistory = new TaskHistory({
    taskId: task._id,
    farmerId: farmerId,
    comment: "Task assigned to farmer",
    status: TASK_ASSIGN_STATUS.assigned,
  });

  await taskHistory.save();
  return task;
};

const changeStatusAssigned = async (taskId, farmerId, status) => {
  const task = await Task.findOne({
    _id: taskId,
    farmerId: farmerId,
  });

  if (!task) {
    throw new NotFoundException("Not found task with id: " + taskId);
  }

  task.status = status;
  await task.save();

  const taskHistory = new TaskHistory({
    taskId: taskId,
    farmerId: farmerId,
    comment: `Task status changed to ${status}`,
    status: status,
  });

  await taskHistory.save();
  return task;
};
const exportTask = async (farmId, gardenId, keyword = "") => {
const filter = {
    name: { $regex: keyword, $options: "i" },
  };
  if (farmId) {
    if (Array.isArray(farmId)) {
      filter.farmId = { $in: farmId };
    } else{
      filter.farmId = farmId;
    }
  }
  if (gardenId) {
    filter.gardenId = gardenId;
  }
  const tasks = await Task.find(filter).
  populate("farmId", "name").
  populate("gardenId", "name").
  populate("createdBy", "fullName");
  return tasks;
}

module.exports = {
  getListPagination,
  getTotal,
  create,
  find,
  update,
  remove,
  assignFarmer,
  getListAssignedPagination,
  getTotalAssigned,
  getDetail,
  changeStatusAssigned,
  exportTask,
};