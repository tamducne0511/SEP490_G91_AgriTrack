const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    // required: true,
  },

  content: {
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

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;