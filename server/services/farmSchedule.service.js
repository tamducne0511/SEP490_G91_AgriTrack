const Farm = require("../models/farm.model");
const mongoose = require("mongoose");
const FarmSchedule = require("../models/farmSchedule.model");

// Hằng số số phần tử mỗi trang cho phân trang
const { LIMIT_ITEM_PER_PAGE } = require("../constants/app");
const NotFoundException = require("../middlewares/exceptions/notfound");

// Lấy danh sách lịch của một nông trại có phân trang và lọc 
const getListPagination = async (farmId, page, keyword) => {
  const list = await FarmSchedule.find({
    farmId: farmId,
    title: { $regex: keyword, $options: "i" },
  })
    .populate("createdBy", "fullName email")
    .select(
      "createdBy fullName email title image description startAt endAt status"
    )
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  return list;
};

// Lấy tổng số bản ghi phân trang
const getTotal = async (farmId, keyword) => {
  const total = await FarmSchedule.countDocuments({
    farmId: farmId,
    title: { $regex: keyword, $options: "i" },
  });

  return total;
};

// Tạo mới lịch nông trại; kiểm tra nông trại tồn tại, gán createdBy
const create = async (userId, data) => {
  try {
    const farm = await Farm.findById(data.farmId);
    if (!farm) {
      throw new NotFoundException("Not found Farm with id: " + data.farmId);
    }

    const farmSchedule = new FarmSchedule(data);
    farmSchedule.createdBy = new mongoose.Types.ObjectId(userId);
    await farmSchedule.save();
    return farmSchedule;
  } catch (error) {
    throw error;
  }
};

// Cập nhật lịch nông trại theo id
const update = async (id, data) => {
  const farmSchedule = await find(id);
  if (!farmSchedule) {
    throw new NotFoundException("Not found farm schedule with id: " + id);
  }

  farmSchedule.title = data.title;
  farmSchedule.image = data.image || farmSchedule.image;
  farmSchedule.description = data.description;
  farmSchedule.startAt = data.startAt;
  farmSchedule.endAt = data.endAt;
  farmSchedule.treeName = data.treeName;
  farmSchedule.treeDescription = data.treeDescription;
  await farmSchedule.save();
  return farmSchedule;
};

// Tìm lịch theo id; nếu id không hợp lệ trả về null
const find = async (id) => {
  try {
    const farmSchedule = await FarmSchedule.findById(id);
    return farmSchedule;
  } catch (error) {
    return null;
  }
};

// Xóa mềm lịch nông vụ status=false
const remove = async (id) => {
  return await FarmSchedule.updateOne({ _id: id }, { status: false });
};

module.exports = {
  getListPagination,
  getTotal,
  create,
  find,
  update,
  remove,
};
