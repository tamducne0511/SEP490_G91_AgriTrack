const Farm = require("../models/farm.model");
const Equipment = require("../models/equipment.model");
const EquipmentChange = require("../models/equipmentChange.model");

const {
  LIMIT_ITEM_PER_PAGE,
  EQUIPMENT_CHANGE_TYPE,
} = require("../constants/app");
const BadRequestException = require("../middlewares/exceptions/badrequest");
const NotFoundException = require("../middlewares/exceptions/notfound");

const getListPagination = async (farmId, status, page) => {
  const list = await EquipmentChange.find({
    farmId: farmId,
    status: status === "all" ? { $ne: null } : status,
  })
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE)
    .populate("farmId")
    .populate("equipmentId")
    .lean();

  const mappedList = list.map((item) => {
    const { farmId, equipmentId, ...rest } = item;
    return {
      ...rest,
      farm: farmId,
      equipment: equipmentId,
    };
  });

  return mappedList;
};

const getTotal = async (farmId, status) => {
  const total = await EquipmentChange.countDocuments({
    farmId: farmId,
    status: status === "all" ? { $ne: null } : status,
  });

  return total;
};

const create = async (data) => {
  try {
    const farm = await Farm.findById(data.farmId);
    if (!farm) {
      throw new NotFoundException("Not found Farm with id: " + data.farmId);
    }

    const equipment = await Equipment.findById(data.equipmentId);
    if (!equipment || equipment.farmId.toString() !== data.farmId) {
      throw new NotFoundException(
        "Not found Equipment with id: " + data.equipmentId
      );
    }

    if (data.type === "export" && equipment.quantity < data.quantity) {
      throw new BadRequestException(
        "Not enough equipment quantity. Available: " + equipment.quantity
      );
    }

    const equipmentChange = new EquipmentChange(data);
    await equipmentChange.save();
    return equipmentChange;
  } catch (error) {
    throw error;
  }
};

const find = async (id) => {
  try {
    const equipmentChange = await EquipmentChange.findById(id);
    return equipmentChange;
  } catch (error) {
    return null;
  }
};

const approve = async (id, userId) => {
  try {
    const equipmentChange = await EquipmentChange.findById(id);
    if (!equipmentChange) {
      throw new NotFoundException("Not found EquipmentChange with id: " + id);
    }

    const equipment = await Equipment.findById(equipmentChange.equipmentId);
    if (!equipment) {
      throw new NotFoundException(
        "Not found Equipment with id: " + equipmentChange.equipmentId
      );
    }

    if (equipmentChange.type === EQUIPMENT_CHANGE_TYPE.export) {
      if (equipment.quantity < equipmentChange.quantity) {
        throw new BadRequestException(
          "Not enough equipment quantity. Available: " + equipment.quantity
        );
      }
    }

    equipmentChange.status = "approved";
    equipmentChange.reviewedAt = new Date();
    equipmentChange.updatedAt = new Date();
    equipmentChange.reviewedBy = userId;
    await equipmentChange.save();

    // Update equipment quantity
    equipment.quantity +=
      equipmentChange.type === EQUIPMENT_CHANGE_TYPE.import
        ? equipmentChange.quantity
        : -equipmentChange.quantity;
    await equipment.save();
    return equipmentChange;
  } catch (error) {
    throw error;
  }
};

const reject = async (id, reason, userId) => {
  try {
    const equipmentChange = await EquipmentChange.findById(id);
    if (!equipmentChange) {
      throw new NotFoundException("Not found EquipmentChange with id: " + id);
    }

    equipmentChange.status = "rejected";
    equipmentChange.reviewedAt = new Date();
    equipmentChange.updatedAt = new Date();
    equipmentChange.rejectReason = reason;
    equipmentChange.reviewedBy = userId;
    await equipmentChange.save();
    return equipmentChange;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getListPagination,
  getTotal,
  create,
  find,
  approve,
  reject,
};