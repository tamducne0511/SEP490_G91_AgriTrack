const mongoose = require("mongoose");

const taskQuestionchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },

  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  image: {
    type: String,
  },

  status: {
    type: Boolean,
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

const TaskQuestion = mongoose.model("TaskQuestion", taskQuestionchema);

module.exports = TaskQuestion;
