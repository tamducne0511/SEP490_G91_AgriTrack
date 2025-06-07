const mongoose = require("mongoose");

const equipmentChangeSchema = new mongoose.Schema({
  equipmentId: {
    type: String,
    required: true,
  },

  farmId: {
    type: String,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  createdBy: {
    type: String,
    required: true,
  },

  reviewedBy: {
    type: String,
    required: false,
  },

  type: {
    type: String,
    required: true,
    default: "import",
  },

  status: {
    type: String,
    required: true,
    default: "pending",
  },

  rejectReason: {
    type: String,
    required: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  reviewedAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const EquipmentChange = mongoose.model(
  "EquipmentChange",
  equipmentChangeSchema
);

module.exports = EquipmentChange;
