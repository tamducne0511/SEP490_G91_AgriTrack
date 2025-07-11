const treeService = require("../../services/tree.service");

const generateTree = async (req, res, next) => {
  try {
    const gardenId = req.params.gardenId;
    const { row, col } = req.body;
    await treeService.generateTree(gardenId, row, col);
    res.status(200).json({
      message: "Generate tree successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getList = async (req, res, next) => {
  try {
    const gardenId = req.params.gardenId;
    const trees = await treeService.getList(gardenId);
    res.status(200).json({
      message: "Get list of tree successfully",
      data: trees,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateTree,
  getList,
};