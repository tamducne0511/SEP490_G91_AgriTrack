const Farm = require("../models/farm.model");
const Equipment = require("../models/equipment.model");
const EquipmentCategory = require("../models/equipmentCategories.model");

const { LIMIT_ITEM_PER_PAGE } = require("../constants/app");
const NotFoundException = require("../middlewares/exceptions/notfound");

const getListPagination = async (farmId, categoryId, page, keyword, status) => {
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

  const list = await Equipment.find(filter)
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  return list;
};

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

const find = async (id) => {
  try {
    const equipment = await Equipment.findById(id);
    return equipment;
  } catch (error) {
    return null;
  }
};

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