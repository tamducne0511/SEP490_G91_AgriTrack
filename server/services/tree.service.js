const Tree = require("../models/tree.model");
const Garden = require("../models/garden.model");
const Farm = require("../models/farm.model");
const NotFoundException = require("../middlewares/exceptions/notfound");
const BadRequestException = require("../middlewares/exceptions/badrequest");
const mongoose = require("mongoose");

/**
 * Tạo mảng  cây theo lưới row x col, bắt đầu từ 0.
 * row - Số hàng
 *  col - Số cột
 */
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

/**
 * tạo tất cả cây theo ma trận row x col.
 * Ném lỗi nếu vườn không tồn tại hoặc vườn đã có cây.
 *  gardenId - Id của vườn
 *  row - Số hàng cây
 *  col - Số cột cây
 */
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

/**
 * Lấy chi tiết một cây kèm garden và farm liên quan.
 * id - Id cây
 */
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

/**
 * Lấy danh sách cây của một vườn, kèm số câu hỏi và câu hỏi mới nhất cho từng cây.
 * gardenId - Id vườn
 */
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
      $lookup: {
        from: "taskquestions",
        let: { treeId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$treeId", "$$treeId"] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          { $project: { "user.password": 0 } },
        ],
        as: "latestQuestion",
      },
    },
    {
      $addFields: {
        questionCount: { $size: "$questions" },
        latestQuestion: { $arrayElemAt: ["$latestQuestion", 0] },
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
