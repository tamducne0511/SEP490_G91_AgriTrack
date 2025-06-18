const Farm = require("../models/farm.model");
const Equipment = require("../models/equipment.model");
const EquipmentCategory = require("../models/equipmentCategories.model");
const Garden = require("../models/garden.model");
const Task = require("../models/task.model");
const User = require("../models/user.model");
const { USER_ROLE, TASK_TYPE } = require("../constants/app");

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

module.exports = {
  getSummary,
};