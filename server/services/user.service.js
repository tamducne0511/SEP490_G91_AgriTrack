const Farm = require("../models/farm.model");
const User = require("../models/user.model");
const Task = require("../models/task.model");
const ExpertFarm = require("../models/expertFarm.model");

const { LIMIT_ITEM_PER_PAGE, USER_ROLE } = require("../constants/app");
const BadRequestException = require("../middlewares/exceptions/badrequest");
const mongoose = require("mongoose");

const getListPagination = async (role, page, keyword) => {
  const filter = {
    fullName: { $regex: keyword, $options: "i" },
  };

  if (role) {
    filter.role = role;
  }

  const list = await User.find(filter)
    .select("-password")
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  return list;
};

const getListFarmerInFarm = async (farmIds, page, keyword) => {
  // farmIds có thể là 1 string hoặc mảng
  let queryFarmIds;
  if (Array.isArray(farmIds)) {
    queryFarmIds = farmIds.map(id => new mongoose.Types.ObjectId(id));
  } else {
    queryFarmIds = [new mongoose.Types.ObjectId(farmIds)];
  }
  const list = await User.find({
    farmId: { $in: queryFarmIds },
    role: USER_ROLE.farmer,
    fullName: { $regex: keyword, $options: "i" },
  })
    .select("-password")
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  return list;
};

const getTotalFarmerInFarm = async (farmIds, keyword) => {
  let queryFarmIds;
  if (Array.isArray(farmIds)) {
    queryFarmIds = farmIds.map(id => new mongoose.Types.ObjectId(id));
  } else {
    queryFarmIds = [new mongoose.Types.ObjectId(farmIds)];
  }
  const total = await User.countDocuments({
    farmId: { $in: queryFarmIds },
    role: USER_ROLE.farmer,
    fullName: { $regex: keyword, $options: "i" },
  });

  return total;
};

const getTotal = async (role, keyword) => {
  const total = await User.countDocuments({
    role: role,
    fullName: { $regex: keyword, $options: "i" },
  });

  return total;
};

const create = async (payload) => {
  const existingUser = await User.find({ email: payload.email });
  if (existingUser.length > 0) {
    throw new BadRequestException("Email already exists");
  }

  const user = new User(payload);
  await user.save();
  return user;
};

const assignFarmToUser = async (userId, farmId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestException("User not found");
  }

  if (user.role !== USER_ROLE.expert && user.role !== USER_ROLE.farmAdmin) {
    throw new BadRequestException(
      "Only farm admin or expert can be assigned a farm"
    );
  }

  if (user.farmId && user.farmId.toString() === farmId) {
    throw new BadRequestException("Farm already assigned to this user");
  } 

  const farm = await Farm.findById(farmId);
  if (!farm) {
    throw new BadRequestException("Farm not found");
  }

  if (user.role === USER_ROLE.farmAdmin) {
    const assignUser = await User.findOne({ farmId: farmId });
    if (assignUser) {
      throw new BadRequestException("Farm already assigned to another user");
    }
  }

  user.farmId = farmId;
  await user.save();
};

const find = async (id) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    return null;
  }
};

const update = async (id, payload) => {
  const user = await User.findById(id);
  if (!user) {
    throw new BadRequestException("User not found");
  }

  user.fullName = payload.fullName || user.fullName;
  user.phone = payload.phone;
  user.address = payload.address;
  user.gender = payload.gender;
  user.avatar = payload.avatar || user.avatar;
  user.birthday = new Date(payload.birthday);
  await user.save();
  return user;
};

const remove = async (id) => {
  return await User.updateOne({ _id: id }, { status: false });
};

const getDetail = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new BadRequestException("User not found");
  }

  const farm = await Farm.findById(user.farmId);
  const tasks = await Task.find({ farmerId: id });

  return {
    user,
    farm,
    tasks,
  };
};

const assignExpertToFarm = async ({ farmId, expertId }) => {
  const expert = await User.findById(expertId);
  if (!expert) {
    throw new BadRequestException("Expert not found");
  }

  if (expert.role !== USER_ROLE.expert) {
    throw new BadRequestException("User is not an expert");
  }

  const farm = await Farm.findById(farmId);
  if (!farm) {
    throw new BadRequestException("Farm not found");
  }

  const expertFarm = await ExpertFarm.findOne({
    expertId: expert._id,
    farmId: farm._id,
  });

  if (expertFarm) {
    throw new BadRequestException("Expert already assigned to this farm");
  }

  const newExpertFarm = new ExpertFarm({
    expertId: expert._id,
    farmId: farm._id,
  });

  await newExpertFarm.save();
};

const removeAssignExpertToFarm = (id) => {
  return ExpertFarm.deleteOne({ _id: id });
};

const getListFarmAssignToExpert = async (expertId) => {
  const farms = await ExpertFarm.find({ expertId: expertId })
    .populate("farmId", "name image description address")
    .select("farmId");

  return farms.map((doc) => ({
    _id: doc._id,
    farm: doc.farmId,
  }));
};

const changeStatus = async (id, status) => {
  const user = await User.findById(id);
  if (!user) {
    throw new BadRequestException("User not found");
  }

  user.status = status;
  await user.save();
  return user;
};

const { hashPassword } = require("../utils/auth.util");

const updatePassword = async (id, newPassword) => {
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    throw new BadRequestException("Password must be at least 6 characters long");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new BadRequestException("User not found");
  }

  user.password = await hashPassword(newPassword);
  await user.save();
  return user;
};
module.exports = {
  getListPagination,
  getTotal,
  create,
  remove,
  find,
  update,
  getDetail,
  assignFarmToUser,
  getListFarmerInFarm,
  getTotalFarmerInFarm,
  assignExpertToFarm,
  removeAssignExpertToFarm,
  getListFarmAssignToExpert,
  changeStatus,
  updatePassword,
};
