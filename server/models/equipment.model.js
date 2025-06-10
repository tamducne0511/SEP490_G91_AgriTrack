const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EquipmentCategory",
    required: true,
  },

  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    // required: true,
  },

  quantity: {
    type: Number,
    required: true,
    default: 0,
  },

  description: {
    type: String,
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

const Equipment = mongoose.model("Equipment", equipmentSchema);

module.exports = Equipment;
