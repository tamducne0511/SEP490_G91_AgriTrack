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
  // Chỉ lấy câu hỏi chính (không có parentId) để phân trang
  const mainFilter = {
    treeId: treeId,
    $or: [
      { parentId: null },
      { parentId: { $exists: false } }
    ]
  };

  // Tìm kiếm theo cả title và content
  if (keyword) {
    mainFilter.$and = [
      {
        $or: [
          { title: { $regex: keyword, $options: "i" } },
          { content: { $regex: keyword, $options: "i" } }
        ]
      }
    ];
  }



  // Lấy câu hỏi chính theo trang
  const mainQuestions = await TaskQuestion.find(mainFilter)
    .populate("userId", "fullName email role")
    .select("userId fullName email title image content createdAt updatedAt parentId")
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  // Lấy tất cả replies cho các câu hỏi chính này
  const mainQuestionIds = mainQuestions.map(q => q._id);
  const replies = await TaskQuestion.find({
    treeId: treeId,
    parentId: { $in: mainQuestionIds }
  })
    .populate("userId", "fullName email role")
    .select("userId fullName email title image content createdAt updatedAt parentId");



  // Kết hợp câu hỏi chính và replies
  const allQuestions = [...mainQuestions, ...replies];



  return allQuestions.map((item) => {
    return {
      ...item._doc,
      createdBy: item.userId,
      userId: undefined,
    };
  });
};

const getTotalByTreeId = async (treeId, keyword) => {
  // Chỉ đếm câu hỏi chính (không có parentId)
  const filter = {
    treeId: treeId,
    $or: [
      { parentId: null },
      { parentId: { $exists: false } }
    ]
  };

  // Tìm kiếm theo cả title và content
  if (keyword) {
    filter.$and = [
      {
        $or: [
          { title: { $regex: keyword, $options: "i" } },
          { content: { $regex: keyword, $options: "i" } }
        ]
      }
    ];
  }

  const total = await TaskQuestion.countDocuments(filter);

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

    // Custom prompt configuration - you can modify this to change AI behavior
    const customPrompt = `Trước khi trả lời bất cứ điều gì, hãy kiểm tra hình ảnh do người dùng cung cấp. Nếu hình ảnh không liên quan đến bất kỳ loại bệnh nào của cây nho, bạn cần nói "Tôi xin lỗi, tôi không thể trả lời câu hỏi đó vì hình ảnh không liên quan đến bất kỳ loại bệnh nào của cây nho. Vui lòng cung cấp hình ảnh liên quan"

    Bạn là một chuyên gia tư vấn nông nghiệp với kiến thức sâu rộng trong việc trồng nho.

    Vui lòng đưa ra lời khuyên chi tiết, thiết thực đó là:
    - Cụ thể và có thể hành động
    - Dựa trên thực hành canh tác bền vững
    - Thích hợp cho nông dân quy mô vừa và nhỏ
    - Tập trung vào các giải pháp hữu cơ khi có thể
    - Được viết bằng ngôn ngữ rõ ràng, dễ hiểu

    Khi phân tích các vấn đề về thực vật, hãy xem xét:
    - Các yếu tố môi trường (thời tiết, đất, nước)
    - Xác định sâu bệnh
    - Thực hành và quản lý văn hóa
    - Chiến lược phòng ngừa cho các vấn đề trong tương lai`;

    // Combine custom prompt with user's question
    const enhancedPrompt = `${customPrompt}\n\nUser Question: ${textPrompt}`;

    const aiRequest = [{ type: "text", text: enhancedPrompt }];

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
