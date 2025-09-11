const mongoose = require("mongoose");

/**
 * Tree schema biểu diễn một cây trong vườn với hàng/cột.
 *\n * Các trường chính:
 * - gardenId: tham chiếu tới `Garden` chứa cây
 * - row: số hàng trong  vườn
 * - col: số cột trong  vườn
 * - status: trạng thái hoạt động của cây 
 * - createdAt/updatedAt: thời gian tạo/cập nhật
 */

const treeSchema = new mongoose.Schema({
  gardenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Garden",
    required: true,
  },

  row: {
    type: Number,
    required: true,
  },

  col: {
    type: Number,
    required: true,
  },

  status: {
    type: Boolean,
    default: true,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Tree = mongoose.model("Tree", treeSchema);

module.exports = Tree;
