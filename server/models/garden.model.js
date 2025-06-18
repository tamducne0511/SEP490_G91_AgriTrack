const mongoose = require("mongoose");

const gardenSchema = new mongoose.Schema({
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

const Garden = mongoose.model("Garden", gardenSchema);

module.exports = Garden;