const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },

  fullName: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
  },

  address: {
    type: String,
  },

  gender: {
    type: String,
  },

  birthday: {
    type: Date,
  },

  avatar: {
    type: String,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
    default: "farmer",
  },

  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
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

const User = mongoose.model("User", userSchema);

module.exports = User;
