const mongoose = require("mongoose");

const taskDailyNoteSchema = new mongoose.Schema({
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

  title: {
    type: String,
    required: true,
  },

  comment: {
    type: String,
    required: true,
  },

  image: {
    type: String,
  },

  quantity: {
    type: Number,
    default: 0,
  },

  status: {
    type: Boolean,
    default: true,
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

const TaskDailyNote = mongoose.model("TaskDailyNote", taskDailyNoteSchema);

module.exports = TaskDailyNote;