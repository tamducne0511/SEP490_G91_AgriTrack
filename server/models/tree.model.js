const mongoose = require("mongoose");

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
