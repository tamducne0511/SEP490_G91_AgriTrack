const mongoose = require("mongoose");

const questionNotificationSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TaskQuestion",
    required: true,
  },

  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
    required: true,
  },

  treeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tree",
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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

  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

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

const QuestionNotification = mongoose.model(
  "QuestionNotification",
  questionNotificationSchema
);

module.exports = QuestionNotification;
