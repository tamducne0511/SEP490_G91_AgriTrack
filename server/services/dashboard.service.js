const Farm = require("../models/farm.model");
const Equipment = require("../models/equipment.model");
const EquipmentCategory = require("../models/equipmentCategories.model");
const Garden = require("../models/garden.model");
const Task = require("../models/task.model");
const User = require("../models/user.model");
const TaskDailyNote = require("../models/taskDailyNote.model");
const TaskDailyNoteEquipment = require("../models/taskDailyNoteEquipment.model");
const { USER_ROLE, TASK_TYPE } = require("../constants/app");

const mongoose = require("mongoose");

const getSummary = async () => {
  const totalFarm = await Farm.countDocuments();
  const totalEquipment = await Equipment.countDocuments();
  const totalEquipmentCategory = await EquipmentCategory.countDocuments();
  const totalGarden = await Garden.countDocuments();
  const totalTask = await Task.countDocuments();
  const totalCareTask = await Task.countDocuments({ type: TASK_TYPE.taskCare });
  const totalCollectTask = await Task.countDocuments({
    type: TASK_TYPE.collect,
  });
  const totalFarmAdmin = await User.countDocuments({
    role: USER_ROLE.farmAdmin,
  });
  const totalFarmer = await User.countDocuments({ role: USER_ROLE.farmer });
  const totalExpert = await User.countDocuments({ role: USER_ROLE.expert });

  return {
    totalFarm,
    totalEquipment,
    totalEquipmentCategory,
    totalGarden,
    totalTask,
    totalFarmAdmin,
    totalFarmer,
    totalExpert,
    totalCareTask,
    totalCollectTask,
  };
};

const getHarvest = async (farmId, fromDate, toDate) => {
  const filter = {
    type: "harvest",
  };

  if (farmId) {
    filter["task.farmId"] = new mongoose.Types.ObjectId(farmId);
  }

  if (fromDate && toDate) {
    filter.createdAt = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
  } else if (fromDate) {
    filter.createdAt = { $gte: new Date(fromDate) };
  } else if (toDate) {
    filter.createdAt = { $lte: new Date(toDate) };
  }

  const result = await TaskDailyNote.aggregate([
    {
      $lookup: {
        from: "tasks",
        localField: "taskId",
        foreignField: "_id",
        as: "task",
      },
    },
    {
      $unwind: "$task",
    },
    {
      $match: filter,
    },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: "$quantity" },
      },
    },
  ]);

  if (result.length === 0) {
    return { totalQuantity: 0 };
  }

  return {
    totalQuantity: result[0].totalQuantity || 0,
  };
};

const getConsumption = async (farmId, fromDate, toDate) => {
  const filter = {};

  if (farmId) {
    filter["task.farmId"] = new mongoose.Types.ObjectId(farmId);
  }

  if (fromDate && toDate) {
    filter.createdAt = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
  } else if (fromDate) {
    filter.createdAt = { $gte: new Date(fromDate) };
  } else if (toDate) {
    filter.createdAt = { $lte: new Date(toDate) };
  }

  const result = await TaskDailyNoteEquipment.aggregate([
    {
      $lookup: {
        from: "taskdailynotes",
        localField: "dailyId",
        foreignField: "_id",
        as: "note",
      },
    },
    {
      $unwind: "$note",
    },
    {
      $lookup: {
        from: "tasks",
        localField: "note.taskId",
        foreignField: "_id",
        as: "task",
      },
    },
    {
      $unwind: "$task",
    },
    {
      $match: filter,
    },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: "$quantity" },
      },
    },
  ]);

  if (result.length === 0) {
    return { totalQuantity: 0 };
  }

  return {
    totalQuantity: result[0].totalQuantity || 0,
  };
};

module.exports = {
  getSummary,
  getHarvest,
  getConsumption,
};
