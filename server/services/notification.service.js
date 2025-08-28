const Farm = require("../models/farm.model");
const Notification = require("../models/notification.model");

const { LIMIT_ITEM_PER_PAGE } = require("../constants/app");
const NotFoundException = require("../middlewares/exceptions/notfound");

const getListPagination = async (farmId, page, keyword) => {
  const list = await Notification.find({
    farmId: farmId,
    title: { $regex: keyword, $options: "i" },
  })
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  return list;
};

const markRead = async (notificationId, userId) => {
  await Notification.findByIdAndUpdate(
    notificationId,
    {
      $addToSet: { readBy: userId },
    },
    { new: true }
  );
};

const getTotalUnread = async (userId, farmId) => {
  const total = await Notification.countDocuments({
    farmId: farmId,
    readBy: { $ne: userId },
  });

  return total;
};

const getTotal = async (farmId, keyword) => {
  const total = await Notification.countDocuments({
    farmId: farmId,
    title: { $regex: keyword, $options: "i" },
  });

  return total;
};

const create = async (data) => {
  try {
    const farm = await Farm.findById(data.farmId);
    if (!farm) {
      throw new NotFoundException("Not found Farm with id: " + data.farmId);
    }

    const notification = new Notification(data);
    await notification.save();
    return notification;
  } catch (error) {
    throw error;
  }
};

const update = async (id, data) => {
  const notification = await find(id);
  if (!notification) {
    throw new NotFoundException("Not found Notification with id: " + id);
  }

  notification.title = data.title;
  notification.image = data.image || notification.image;
  notification.content = data.content;
  await notification.save();
  return notification;
};

const find = async (id) => {
  try {
    const notification = await Notification.findById(id);
    return notification;
  } catch (error) {
    return null;
  }
};

const remove = async (id) => {
  return await Notification.updateOne({ _id: id }, { status: false });
};

// Tạo notification cho task bị xóa
const createTaskDeleteNotification = async (task, deleteReason, deletedByUser) => {
  const notificationData = {
    farmId: task.farmId,
    title: `Công việc "${task.name}" đã bị xóa`,
    content: `Công việc "${task.name}" đã bị xóa bởi ${deletedByUser.fullName}. Lý do: ${deleteReason}`,
    image: task.image || "",
  };

  const notification = new Notification(notificationData);
  await notification.save();
  return notification;
};

module.exports = {
  getListPagination,
  getTotal,
  create,
  find,
  update,
  remove,
  markRead,
  getTotalUnread,
  createTaskDeleteNotification,
};