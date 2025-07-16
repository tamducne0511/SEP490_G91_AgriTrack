const Tree = require("../models/tree.model");
const Garden = require("../models/garden.model");
const NotFoundException = require("../middlewares/exceptions/notfound");
const BadRequestException = require("../middlewares/exceptions/badrequest");

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

const getList = async (gardenId) => {
  const trees = await Tree.find({ gardenId: gardenId });
  return trees;
};

module.exports = {
  generateTree,
  getList,
};