const mongoose = require("mongoose");

const taskDailyNoteEquipmentSchema = new mongoose.Schema({
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment",
    required: true,
  },

  dailyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TaskDailyNote",
    required: true,
  },

  quantity: {
    type: Number,
    default: 0,
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

const TaskDailyNoteEquipment = mongoose.model(
  "TaskDailyNoteEquipment",
  taskDailyNoteEquipmentSchema
);

module.exports = TaskDailyNoteEquipment;
