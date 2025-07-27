const TaskQuestion = require("../models/taskQuestion.model");
const ExpertFarm = require("../models/expertFarm.model");
const QuestionNotification = require("../models/questionNotification.model");

const NotFoundException = require("../middlewares/exceptions/notfound");

const getList = async (farmId) => {
  const list = await QuestionNotification.find({
    farmId: farmId,
  })
    .sort({ createdAt: -1 })
    .populate("userId", "fullName email role _id")
    .populate("questionId")
    .populate("farmId")
    .populate("treeId");

  return list.map((item) => ({
    ...item.toObject(),
    userId: undefined,
    user: item.userId,
    questionId: undefined,
    question: item.questionId,
    farmId: undefined,
    farm: item.farmId,
    treeId: undefined,
    tree: item.treeId,
  }));
};

const getListByUser = async (userId) => {
  const listFarm = await ExpertFarm.find({ expertId: userId });
  const listFarmId = listFarm.map((item) => item.farmId);
  const list = await QuestionNotification.find({
    farmId: { $in: listFarmId },
  })
    .sort({ createdAt: -1 })
    .populate("userId", "fullName email role _id")
    .populate("questionId")
    .populate("farmId")
    .populate("treeId");

  return list.map((item) => ({
    ...item.toObject(),
    userId: undefined,
    user: item.userId,
    questionId: undefined,
    question: item.questionId,
    farmId: undefined,
    farm: item.farmId,
    treeId: undefined,
    tree: item.treeId,
  }));
};

const create = async (data) => {
  try {
    const taskQuestion = await TaskQuestion.findById(data.questionId);
    if (!taskQuestion) {
      throw new NotFoundException(
        "Not found TaskQuestion with id: " + data.questionId
      );
    }

    data.farmId = taskQuestion.farmId;
    data.treeId = taskQuestion.treeId;
    const notification = new QuestionNotification(data);
    await notification.save();
    return notification;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getList,
  create,
  getListByUser,
};
