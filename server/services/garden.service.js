const Farm = require("../models/farm.model");
const Garden = require("../models/garden.model");
const Task = require("../models/task.model");
const Tree = require("../models/tree.model");
const mongoose = require("mongoose");

const { LIMIT_ITEM_PER_PAGE } = require("../constants/app");
const NotFoundException = require("../middlewares/exceptions/notfound");

const getListPagination = async (farmId, page, keyword) => {
  const list = await Garden.find({
    farmId: farmId,
    name: { $regex: keyword, $options: "i" },
  })
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  return list;
};

const getTotal = async (farmId, keyword) => {
  const total = await Garden.countDocuments({
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

    const garden = new Garden(data);
    await garden.save();
    return garden;
  } catch (error) {
    throw error;
  }
};

const update = async (id, data) => {
  const garden = await find(id);
  if (!garden) {
    throw new NotFoundException("Not found garden with id: " + id);
  }

  garden.name = data.name;
  garden.image = data.image || garden.image;
  garden.description = data.description;
  await garden.save();
  return garden;
};

const find = async (id) => {
  try {
    const garden = await Garden.findById(id);
    return garden;
  } catch (error) {
    return null;
  }
};

const getDetail = async (id) => {
  try {
    const garden = await Garden.findById(id);
    const trees = await Tree.find({ gardenId: id });
    const tasks = await Task.aggregate([
      {
        $match: {
          gardenId: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "farmerId",
          foreignField: "_id",
          as: "farmer",
        },
      },
      {
        $unwind: {
          path: "$farmer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          "farmer.password": 0,
        },
      },
    ]);

    return {
      ...garden,
      tasks,
      trees,
    };
  } catch (error) {
    return null;
  }
};

const remove = async (id) => {
  return await Garden.updateOne({ _id: id }, { status: false });
};

module.exports = {
  getListPagination,
  getTotal,
  create,
  find,
  update,
  remove,
  getDetail,
};
