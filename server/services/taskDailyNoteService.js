const mongoose = require("mongoose");
const Task = require("../models/task.model");
const TaskDailyNote = require("../models/taskDailyNote.model");

const getListByTaskId = async (taskId) => {
  return TaskDailyNote.find({
    taskId: new mongoose.Types.ObjectId(taskId),
  }).sort({ createdAt: -1 });
};

const create = async (taskId, farmerId, data) => {
  try {
    const task = await Task.findOne({
      _id: taskId,
      farmerId: farmerId,
    });

    if (!task) {
      throw new Error("Not found task with id: " + taskId);
    }

    const taskDailyNote = new TaskDailyNote({
      farmerId: farmerId,
      taskId: taskId,
      title: data.title,
      comment: data.comment,
      image: data.image || "",
      quantity: data.quantity || 0,
    });

    await taskDailyNote.save();
    return taskDailyNote;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  getListByTaskId,
};