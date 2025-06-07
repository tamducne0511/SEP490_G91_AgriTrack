const mongoose = require("mongoose");

const equipmentCategorySchema = new mongoose.Schema({
  farmId: {
    type: String,
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

const EquipmentCategory = mongoose.model(
  "EquipmentCategory",
  equipmentCategorySchema
);

module.exports = EquipmentCategory;
