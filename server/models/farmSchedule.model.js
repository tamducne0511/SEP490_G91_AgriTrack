const mongoose = require("mongoose");

const farmScheduleSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  treeName: {
    type: String,
    required: true,
  },

  treeDescription: {
    type: String,
    required: true,
  },

  startAt: {
    type: Date,
    required: true,
  },

  endAt: {
    type: Date,
    required: true,
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

const FarmSchedule = mongoose.model("FarmSchedule", farmScheduleSchema);

module.exports = FarmSchedule;
