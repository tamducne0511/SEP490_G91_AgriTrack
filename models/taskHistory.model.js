const mongoose = require("mongoose");

const taskHistorychema = new mongoose.Schema({
  farmerId: {
    type: String,
    required: true,
  },

  taskId: {
    type: String,
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
