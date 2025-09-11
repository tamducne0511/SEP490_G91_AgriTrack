const treeService = require("../../services/tree.service");

/**
 * Tạo dữ liệu cây cho một vườn theo ma trận row x col.
 * Body: { row: number, col: number }
 */
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

/**
 * Lấy danh sách cây của vườn, kèm tổng số câu hỏi và câu hỏi mới nhất.
 */
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

/**
 * GET /admin/tree/:id
 * Lấy chi tiết một cây, bao gồm garden và farm liên quan.
 */
const getDetail = async (req, res, next) => {
  try {
    const tree = await treeService.getDetail(req.params.id);
    res.status(200).json({
      message: "Get detail of tree successfully",
      data: tree,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateTree,
  getList,
  getDetail,
};
