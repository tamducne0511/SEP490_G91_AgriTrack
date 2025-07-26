const { OpenAI } = require("openai");
const axios = require("axios");

const Farm = require("../models/farm.model");
const mongoose = require("mongoose");
const Tree = require("../models/tree.model");
const User = require("../models/user.model");
const Garden = require("../models/garden.model");
const TaskQuestion = require("../models/taskQuestion.model");

const { LIMIT_ITEM_PER_PAGE, USER_ROLE } = require("../constants/app");
const NotFoundException = require("../middlewares/exceptions/notfound");

const getListPagination = async (farmId, page, keyword) => {
  const list = await TaskQuestion.find({
    farmId: farmId,
    title: { $regex: keyword, $options: "i" },
  })
    .populate("userId", "fullName email")
    .select(
      "userId fullName email title image treeId content createdAt updatedAt"
    )
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  return [...list].map((item) => {
    return {
      ...item._doc,
      createdBy: item.userId,
      userId: undefined,
    };
  });
};

const getTotal = async (farmId, keyword) => {
  const total = await TaskQuestion.countDocuments({
    farmId: farmId,
    title: { $regex: keyword, $options: "i" },
  });

  return total;
};

const getDetail = async (id) => {
  const taskQuestion = await TaskQuestion.findById(id);
  const tree = await Tree.findById(taskQuestion.treeId);
  const garden = await Garden.findById(tree.gardenId);
  const farm = await Farm.findById(garden.farmId);
  return {
    detail: taskQuestion,
    tree,
    garden,
    farm,
  };
};

const getListPaginationByTreeId = async (treeId, page, keyword) => {
  const list = await TaskQuestion.find({
    treeId: treeId,
    title: { $regex: keyword, $options: "i" },
  })
    .populate("userId", "fullName email role")
    .select("userId fullName email title image content createdAt updatedAt")
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  return [...list].map((item) => {
    return {
      ...item._doc,
      createdBy: item.userId,
      userId: undefined,
    };
  });
};

const getTotalByTreeId = async (treeId, keyword) => {
  const total = await TaskQuestion.countDocuments({
    treeId: treeId,
    title: { $regex: keyword, $options: "i" },
  });

  return total;
};

const create = async (userId, data) => {
  try {
    const tree = await Tree.findById(data.treeId);
    if (!tree) {
      throw new NotFoundException("Not found tree with id: " + data.taskId);
    }

    const garden = await Garden.findById(tree.gardenId);
    if (!garden) {
      throw new NotFoundException("Not found garden with id: " + tree.gardenId);
    }

    const farm = await Farm.findById(garden.farmId);
    if (!farm) {
      throw new NotFoundException("Not found farm with id: " + garden.farmId);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundException("Not found user with id: " + userId);
    }

    if (user.role === USER_ROLE.farmer) {
      if (user.farmId.toString() !== farm._id.toString()) {
        throw new NotFoundException(
          "Farmer does not have permission to create question for this farm"
        );
      }
    }

    const taskQuestion = new TaskQuestion(data);
    taskQuestion.farmId = farm._id;
    taskQuestion.status = true;
    taskQuestion.userId = new mongoose.Types.ObjectId(userId);
    await taskQuestion.save();
    return taskQuestion;
  } catch (error) {
    throw error;
  }
};

const askAI = async (textPrompt, imageUrl) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const aiRequest = [{ type: "text", text: textPrompt }];

    if (imageUrl) {
      const responseImage = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });

      const contentType = responseImage.headers["content-type"];
      const base64 = Buffer.from(responseImage.data, "binary").toString(
        "base64"
      );
      const base64Image = `data:${contentType};base64,${base64}`;

      aiRequest.push({
        type: "image_url",
        image_url: {
          url: base64Image,
        },
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: aiRequest,
        },
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.log(err);
    throw new Error(err.response?.data || err.message);
  }
};

const getWeather = async () => {
  const axios = require("axios");
  const response = await axios.get(
    `https://api.weatherapi.com/v1/forecast.json?key=${process.env.OPEN_WEATHER_API_KEY}&q=HaNoi&days=2&aqi=no&alerts=no`
  );

  return response.data;
};

module.exports = {
  getListPagination,
  getTotal,
  create,
  getListPaginationByTreeId,
  getTotalByTreeId,
  askAI,
  getWeather,
  getDetail,
};
