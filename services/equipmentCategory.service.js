const Farm = require("../models/farm.model");
const EquipmentCategory = require("../models/equipmentCategories.model");

const { LIMIT_ITEM_PER_PAGE } = require("../constants/app");
const NotFoundException = require("../middlewares/exceptions/notfound");

const getListPagination = async (farmId, page, keyword) => {
  const list = await EquipmentCategory.find({
    farmId: farmId,
    name: { $regex: keyword, $options: "i" },
  })
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  return list;
};

const getTotal = async (farmId, keyword) => {
  const total = await EquipmentCategory.countDocuments({
    farmId: farmId,
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

    const equipmentCategory = new EquipmentCategory(data);
    await equipmentCategory.save();
    return equipmentCategory;
  } catch (error) {
    throw error;
  }
};

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

const find = async (id) => {
  try {
    const equipmentCategory = await EquipmentCategory.findById(id);
    return equipmentCategory;
  } catch (error) {
    return null;
  }
};

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
