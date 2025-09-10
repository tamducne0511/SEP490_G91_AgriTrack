const Farm = require("../models/farm.model");
const Equipment = require("../models/equipment.model");
const EquipmentCategory = require("../models/equipmentCategories.model");

const { LIMIT_ITEM_PER_PAGE } = require("../constants/app");
const NotFoundException = require("../middlewares/exceptions/notfound");

/*
  Lấy danh sách thiết bị theo phân trang và bộ lọc
  param farmId - Id nông trại (bắt buộc, lấy từ user)
  param categoryId - Id danh mục thiết bị để lọc 
  param number page - Trang hiện tại (>=1)
  param keyword - Từ khóa tìm theo tên (không phân biệt hoa hay thường)
  param status - Trạng thái hoạt động: "1" (true), "0" (false)
 */
const getListPagination = async (farmId, categoryId, page, keyword, status) => {
  // Tạo filter cơ bản theo farmId và tìm tên theo regex không phân biệt hoa hay thường
  const filter = {
    farmId: farmId,
    name: { $regex: keyword, $options: "i" },
  };

  if (categoryId) {
    filter.categoryId = categoryId;
  }

  if (status === "1" || status === "0") {
    filter.status = status === "1";
  }

  // Truy vấn danh sách theo filter + phân trang số lượng item trên 1 trang là LIMIT_ITEM_PER_PAGE
  const list = await Equipment.find(filter)
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  return list;
};

  // Đếm tổng số bản ghi theo filter
const getTotal = async (farmId, categoryId, keyword, status) => {
  const filter = {
    farmId: farmId,
    name: { $regex: keyword, $options: "i" },
  };

  if (categoryId) {
    filter.categoryId = categoryId;
  }

  if (status === "1" || status === "0") {
    filter.status = status === "1";
  }

  const total = await Equipment.countDocuments(filter);
  return total;
};

  // Tạo thiết bị mới và kiểm tra tồn tại Farm và EquipmentCategory trước khi tạo
const create = async (data) => {
  try {
    const farm = await Farm.findById(data.farmId);
    if (!farm) {
      throw new NotFoundException("Not found Farm with id: " + data.farmId);
    }

    const category = await EquipmentCategory.findById(data.categoryId);
    if (!category) {
      throw new NotFoundException(
        "Not found EquipmentCategory with id: " + data.categoryId
      );
    }

    const equipment = new Equipment(data);
    await equipment.save();
    return equipment;
  } catch (error) {
    throw error;
  }
};

  // Cập nhật thông tin thiết bị, không cập nhật các trường không gửi lên (image giữ nguyên nếu không có)
const update = async (id, data) => {
  const equipment = await find(id);
  if (!equipment) {
    throw new NotFoundException("Not found Equipment with id: " + id);
  }

  equipment.name = data.name;
  equipment.image = data.image || equipment.image;
  equipment.description = data.description;
  equipment.categoryId = data.categoryId;
  await equipment.save();
  return equipment;
};

  // Tìm 1 thiết bị theo id return {Equipment|null}
const find = async (id) => {
  try {
    const equipment = await Equipment.findById(id);
    return equipment;
  } catch (error) {
    // Trường hợp id không hợp lệ (ObjectId sai) => trả về null
    return null;
  }
};

  // Xóa mềm thiết bị đặt status=false
const remove = async (id) => {
  return await Equipment.updateOne({ _id: id }, { status: false });
};

module.exports = {
  getListPagination,
  getTotal,
  create,
  find,
  update,
  remove,
};
