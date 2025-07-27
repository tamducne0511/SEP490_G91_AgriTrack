const Tree = require("../models/tree.model");
const Garden = require("../models/garden.model");
const Farm = require("../models/farm.model");
const NotFoundException = require("../middlewares/exceptions/notfound");
const BadRequestException = require("../middlewares/exceptions/badrequest");
const mongoose = require("mongoose");

const genArrayData = (row, col) => {
  let data = [];
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      data.push({
        row: i,
        col: j,
      });
    }
  }

  return data;
};

const generateTree = async (gardenId, row, col) => {
  const garden = Garden.findById(gardenId);
  if (!garden) {
    throw new NotFoundException();
  }

  const existedTree = await Tree.countDocuments({
    gardenId: gardenId,
  });

  if (existedTree > 0) {
    throw new BadRequestException("Tree already exists for this garden");
  }

  const arr = genArrayData(row, col);
  for (let i = 0; i < arr.length; i++) {
    const tree = new Tree({
      gardenId: gardenId,
      row: arr[i].row,
      col: arr[i].col,
    });

    await tree.save();
  }
};

const getDetail = async (id) => {
  const tree = await Tree.findById(id);
  if (!tree) {
    throw new NotFoundException();
  }

  const garden = await Garden.findById(tree.gardenId);
  const farm = await Farm.findById(garden.farmId);

  return {
    detail: tree,
    garden,
    farm,
  };
};

const getList = async (gardenId) => {
  const trees = await Tree.aggregate([
    {
      $match: {
        gardenId: new mongoose.Types.ObjectId(gardenId),
      },
    },
    {
      $lookup: {
        from: "taskquestions",
        localField: "_id",
        foreignField: "treeId",
        as: "questions",
      },
    },
    {
      $addFields: {
        questionCount: { $size: "$questions" },
      },
    },
    {
      $project: {
        questions: 0,
      },
    },
  ]);

  return trees;
};

module.exports = {
  generateTree,
  getList,
  getDetail,
};
