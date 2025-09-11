const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
    required: true,
  },

  gardenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Garden",
    required: false,
    default: null,
  },

  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  image: {
    type: String,
  },

  type: {
    type: String,
    required: true,
    default: "collect",
  },

  priority: {
    type: String,
    required: true,
    default: "low",
  },

  status: {
    type: String,
    default: "un-assign",
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

  startDate: {
    type: Date,
    required: false,
  },
  
  endDate: {
    type: Date,
    required: false,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Thêm các trường cho việc xóa task
  deleteReason: {
    type: String,
    default: null,
  },

  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  deletedAt: {
    type: Date,
    default: null,
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;