const Farm = require("../models/farm.model");
const User = require("../models/user.model");
const Garden = require("../models/garden.model");

const { LIMIT_ITEM_PER_PAGE, USER_ROLE } = require("../constants/app");
const NotFoundException = require("../middlewares/exceptions/notfound");

const getListPagination = async (page, keyword) => {
  const listFarm = await Farm.find({
    name: { $regex: keyword, $options: "i" },
  })
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  return listFarm;
};

const getTotal = async (keyword) => {
  const totalFarm = await Farm.countDocuments({
    name: { $regex: keyword, $options: "i" },
  });

  return totalFarm;
};

const create = async (data) => {
  const farm = new Farm(data);
  await farm.save();
  return farm;
};

const update = async (id, data) => {
  const farm = await find(id);
  if (!farm) {
    throw new NotFoundException("Not found farm with id: " + id);
  }

  farm.name = data.name;
  farm.description = data.description;
  farm.address = data.address;
  farm.image = data.image || farm.image;
  await farm.save();
  return farm;
};

const getDetail = async (id) => {
  const farm = await find(id);
  const owner = await User.findOne({ farmId: id, role: USER_ROLE.farmAdmin });
  const farmers = await User.find({ farmId: id, role: USER_ROLE.farmer });
  const experts = await User.find({ farmId: id, role: USER_ROLE.expert });
  const gardens = await Garden.find({ farmId: id });
  if (!farm) {
    throw new NotFoundException("Not found farm with id: " + id);
  }

  return {
    farm,
    owner,
    farmers,
    experts,
    gardens,
  };
};

const find = async (id) => {
  try {
    const farm = await Farm.findById(id);
    return farm;
  } catch (error) {
    return null;
  }
};

const getListFarmUnassigned = async () => {
  return await Farm.aggregate([
    {
      $lookup: {
        from: "User",
        localField: "farmId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $match: {
        user: [],
      },
    },
  ]);
};

const remove = async (id) => {
  return await Farm.updateOne({ _id: id }, { status: false });
};

module.exports = {
  getListPagination,
  getTotal,
  create,
  find,
  update,
  remove,
  getDetail,
  getListFarmUnassigned,
};