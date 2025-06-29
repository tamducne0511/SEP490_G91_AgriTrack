const mongoose = require("mongoose");

const taskHistorychema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },

  comment: {
    type: String,
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

const TaskHistory = mongoose.model("TaskHistory", taskHistorychema);

module.exports = TaskHistory;