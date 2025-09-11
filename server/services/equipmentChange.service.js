const Farm = require("../models/farm.model");
const Equipment = require("../models/equipment.model");
const EquipmentChange = require("../models/equipmentChange.model");

const {
  LIMIT_ITEM_PER_PAGE,
  EQUIPMENT_CHANGE_TYPE,
} = require("../constants/app");
const BadRequestException = require("../middlewares/exceptions/badrequest");
const NotFoundException = require("../middlewares/exceptions/notfound");

// Lấy danh sách phiếu thay đổi theo trang, lọc theo trạng thái và tìm theo tên thiết bị
const getListPagination = async (farmId, status, page, keyword = "") => {
  let query = {
    farmId: farmId,
    status: status === "all" ? { $ne: null } : status,
  };

  // Nếu có keyword, tìm theo equipment name thông qua lookup
  if (keyword) {
    const list = await EquipmentChange.aggregate([
      {
        $match: {
          farmId: farmId,
          status: status === "all" ? { $ne: null } : status,
        }
      },
      {
        $lookup: {
          from: "equipment",
          localField: "equipmentId",
          foreignField: "_id",
          as: "equipment"
        }
      },
      {
        $unwind: "$equipment"
      },
      {
        $match: {
          "equipment.name": { $regex: keyword, $options: "i" }
        }
      },
      {
        $skip: (page - 1) * LIMIT_ITEM_PER_PAGE
      },
      {
        $limit: LIMIT_ITEM_PER_PAGE
      }
    ]);
    return list;
  }

  const list = await EquipmentChange.find(query)
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

// Đếm tổng số phiếu theo filter (có hỗ trợ tìm theo tên thiết bị)
const getTotal = async (farmId, status, keyword = "") => {
  if (keyword) {
    const total = await EquipmentChange.aggregate([
      {
        $match: {
          farmId: farmId,
          status: status === "all" ? { $ne: null } : status,
        }
      },
      {
        $lookup: {
          from: "equipment",
          localField: "equipmentId",
          foreignField: "_id",
          as: "equipment"
        }
      },
      {
        $unwind: "$equipment"
      },
      {
        $match: {
          "equipment.name": { $regex: keyword, $options: "i" }
        }
      },
      {
        $count: "total"
      }
    ]);
    return total[0]?.total || 0;
  }

  const total = await EquipmentChange.countDocuments({
    farmId: farmId,
    status: status === "all" ? { $ne: null } : status,
  });

  return total;
};

// Tạo phiếu thay đổi: kiểm tra Farm/Equipment; ràng buộc số lượng khi xuất
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

// Tìm phiếu theo id (trả null nếu id không hợp lệ)
const find = async (id) => {
  try {
    const equipmentChange = await EquipmentChange.findById(id);
    return equipmentChange;
  } catch (error) {
    return null;
  }
};

// Duyệt phiếu: cập nhật trạng thái, thời gian, người duyệt; đồng thời cập nhật số lượng thiết bị
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

    // Cập nhật số lượng thiết bị theo loại phiếu
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

// Từ chối phiếu: cập nhật trạng thái, thời gian, người duyệt và lý do
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
