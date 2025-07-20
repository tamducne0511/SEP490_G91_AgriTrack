const mongoose = require("mongoose");
const Task = require("../models/task.model");
const TaskDailyNote = require("../models/taskDailyNote.model");
const Equipment = require("../models/equipment.model");
const TaskDailyNoteEquipment = require("../models/taskDailyNoteEquipment.model");

const getListByTaskId = async (taskId) => {
  return TaskDailyNote.find({
    taskId: new mongoose.Types.ObjectId(taskId),
  }).sort({ createdAt: -1 });
};

const getDetail = async (id) => {
  const taskDailyNote = await TaskDailyNote.findById(id);
  if (!taskDailyNote) {
    throw new Error("Not found task daily note with id: " + id);
  }

  const detail = {
    taskDailyNote,
  };

  if (taskDailyNote.type === "consumption") {
    const equipments = await TaskDailyNoteEquipment.find({
      dailyId: taskDailyNote._id,
    }).populate("equipmentId");

    detail.equipments = equipments.map((item) => ({
      ...item.toObject(),
      equipment: item.equipmentId.toObject(),
      equipmentId: undefined,
    }));
  }

  return detail;
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

    if (data.type === "consumption") {
      const listEquipment = JSON.parse(data.equipments);
      for (const item of listEquipment) {
        const equipment = await Equipment.findById(item.id);
        if (!equipment) {
          throw new Error("Not found equipment with id: " + equipment.id);
        }

        if (equipment.quantity < item.quantity) {
          throw new Error(
            `Not enough quantity for equipment: ${equipment.name}. Available: ${equipment.quantity}, Requested: ${item.quantity}`
          );
        }
      }
    }

    const taskDailyNote = new TaskDailyNote({
      farmerId: farmerId,
      taskId: taskId,
      title: data.title,
      comment: data.comment,
      type: data.type,
      image: data.image || "",
      quantity: data.quantity || 0,
    });

    await taskDailyNote.save();

    if (data.type === "consumption") {
      // Update equipment quantities and create TaskDailyNoteEquipment entries
      const listEquipment = JSON.parse(data.equipments);
      for (const item of listEquipment) {
        const equipment = await Equipment.findById(item.id);
        const taskDailyNoteEquipment = new TaskDailyNoteEquipment({
          equipmentId: equipment._id,
          dailyId: taskDailyNote._id,
          quantity: item.quantity,
        });

        equipment.quantity -= item.quantity;
        await equipment.save();
        await taskDailyNoteEquipment.save();
      }
    }

    return taskDailyNote;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getDetail,
  create,
  getListByTaskId,
};
