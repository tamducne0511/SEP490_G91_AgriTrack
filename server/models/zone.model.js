const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema({
  gardenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Garden",
    required: true,
  },

  row: {
    type: Number,
    required: true,
  },

  col: {
    type: Number,
    required: true,
  },

  status: {
    type: Boolean,
    default: true,
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

const Zone = mongoose.model("Zone", zoneSchema);

module.exports = Zone;
