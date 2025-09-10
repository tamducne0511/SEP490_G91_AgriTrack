const Farm = require("../models/farm.model");
const EquipmentCategory = require("../models/equipmentCategories.model");

const { LIMIT_ITEM_PER_PAGE } = require("../constants/app");
const NotFoundException = require("../middlewares/exceptions/notfound");

// Lấy danh sách danh mục theo phân trang và tên danh mục
const getListPagination = async (farmId, page, keyword, pageSize = LIMIT_ITEM_PER_PAGE) => {
  const list = await EquipmentCategory.find({
    farmId: farmId,
    name: { $regex: keyword, $options: "i" },
  })
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  return list;
};

// Đếm tổng số danh mục 
const getTotal = async (farmId, keyword) => {
  const total = await EquipmentCategory.countDocuments({
    farmId: farmId,
    name: { $regex: keyword, $options: "i" },
  });

  return total;
};

// Tạo mới danh mục sau khi xác thực Farm tồn tại
const create = async (data) => {
  try {
    const farm = await Farm.findById(data.farmId);
    if (!farm) {
      throw new NotFoundException("Not found Farm with id: " + data.farmId);
    }

    const equipmentCategory = new EquipmentCategory(data);
    await equipmentCategory.save();
    return equipmentCategory;
  } catch (error) {
    throw error;
  }
};

// Cập nhật danh mục: giữ nguyên image nếu không gửi ảnh mới
const update = async (id, data) => {
  const equipmentCategory = await find(id);
  if (!equipmentCategory) {
    throw new NotFoundException("Not found EquipmentCategory with id: " + id);
  }

  equipmentCategory.name = data.name;
  equipmentCategory.image = data.image || equipmentCategory.image;
  equipmentCategory.description = data.description;
  await equipmentCategory.save();
  return equipmentCategory;
};

// Tìm danh mục theo id (trả null nếu id không hợp lệ)
const find = async (id) => {
  try {
    const equipmentCategory = await EquipmentCategory.findById(id);
    return equipmentCategory;
  } catch (error) {
    return null;
  }
};

// Xóa mềm danh mục (status=false)
const remove = async (id) => {
  return await EquipmentCategory.updateOne({ _id: id }, { status: false });
};

module.exports = {
  getListPagination,
  getTotal,
  create,
  find,
  update,
  remove,
};
