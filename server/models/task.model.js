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
    required: true,
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
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;