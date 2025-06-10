const Farm = require("../models/farm.model");
const User = require("../models/user.model");

const { LIMIT_ITEM_PER_PAGE, USER_ROLE } = require("../constants/app");
const BadRequestException = require("../middlewares/exceptions/badrequest");

const getListPagination = async (role, page, keyword) => {
  const list = await User.find({
    role: role,
    fullName: { $regex: keyword, $options: "i" },
  })
    .select("-password")
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  return list;
};

const getListFarmerInFarm = async (farmId, page, keyword) => {
  const list = await User.find({
    farmId: farmId,
    role: USER_ROLE.farmer,
    fullName: { $regex: keyword, $options: "i" },
  })
    .select("-password")
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  return list;
};

const getTotal = async (role, keyword) => {
  const total = await User.countDocuments({
    role: role,
    fullName: { $regex: keyword, $options: "i" },
  });

  return total;
};

const getTotalFarmerInFarm = async (farmId, keyword) => {
  const total = await User.countDocuments({
    farmId: farmId,
    role: USER_ROLE.farmer,
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
  await user.save();
  return user;
};

const remove = async (id) => {
  return await User.updateOne({ _id: id }, { status: false });
};

module.exports = {
  getListPagination,
  getTotal,
  create,
  remove,
  find,
  update,
  assignFarmToUser,
  getListFarmerInFarm,
  getTotalFarmerInFarm,
};
