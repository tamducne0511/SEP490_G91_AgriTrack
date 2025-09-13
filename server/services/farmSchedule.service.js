const Farm = require("../models/farm.model");
const mongoose = require("mongoose");
const FarmSchedule = require("../models/farmSchedule.model");
const Task = require("../models/task.model");
const { OpenAI } = require("openai");

const { LIMIT_ITEM_PER_PAGE } = require("../constants/app");
const NotFoundException = require("../middlewares/exceptions/notfound");

const getListPagination = async (farmId, page, keyword) => {
  const list = await FarmSchedule.find({
    farmId: farmId,
    title: { $regex: keyword, $options: "i" },
  })
    .populate("createdBy", "fullName email")
    .select(
      "createdBy fullName email title image description startAt endAt status"
    )
    .skip((page - 1) * LIMIT_ITEM_PER_PAGE)
    .limit(LIMIT_ITEM_PER_PAGE);

  return list;
};

const getTotal = async (farmId, keyword) => {
  const total = await FarmSchedule.countDocuments({
    farmId: farmId,
    title: { $regex: keyword, $options: "i" },
  });

  return total;
};

const create = async (userId, data) => {
  try {
    const farm = await Farm.findById(data.farmId);
    if (!farm) {
      throw new NotFoundException("Not found Farm with id: " + data.farmId);
    }

    const farmSchedule = new FarmSchedule(data);
    farmSchedule.createdBy = new mongoose.Types.ObjectId(userId);
    await farmSchedule.save();
    return farmSchedule;
  } catch (error) {
    throw error;
  }
};

const update = async (id, data) => {
  const farmSchedule = await find(id);
  if (!farmSchedule) {
    throw new NotFoundException("Not found farm schedule with id: " + id);
  }

  farmSchedule.title = data.title;
  farmSchedule.image = data.image || farmSchedule.image;
  farmSchedule.description = data.description;
  farmSchedule.startAt = data.startAt;
  farmSchedule.endAt = data.endAt;
  farmSchedule.treeName = data.treeName;
  farmSchedule.treeDescription = data.treeDescription;
  await farmSchedule.save();
  return farmSchedule;
};

const find = async (id) => {
  try {
    const farmSchedule = await FarmSchedule.findById(id);
    return farmSchedule;
  } catch (error) {
    return null;
  }
};

const remove = async (id) => {
  return await FarmSchedule.updateOne({ _id: id }, { status: false });
};
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const generateTasksFromSchedule = async (farmSchedule) => {
  // Tạo prompt cho AI
  const prompt = `
    Bạn là chuyên gia nông nghiệp. 
    Hãy phân tích lịch trình sau và chia thành các công việc chi tiết cho công nhân nông trại. Và ngày tháng phải liên tiếp từ công việc này đến công việc khác. Thời gian phải bắt đầu tính từ ngày hiện tại
    13/09/2025
    Lịch trình: "${farmSchedule.description}"

    Yêu cầu output:
    - Trả về chỉ JSON array
    - Mỗi object có cấu trúc:
      {
        "name": "Tên công việc",
        "description": "Mô tả chi tiết",
        "priority": "high|medium|low",
        "startDate": "yyyy-mm-dd",
        "endDate": "yyyy-mm-dd"
      }
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1000,
  });

  function extractJSON(content) {
    try {
      // Nếu có block ```json ... ```
      const match = content.match(/```json([\s\S]*?)```/);
      if (match) {
        return JSON.parse(match[1].trim());
      }
  
      // Nếu có block ``` ... ```
      const altMatch = content.match(/```([\s\S]*?)```/);
      if (altMatch) {
        return JSON.parse(altMatch[1].trim());
      }
  
      // Nếu không có block nào, thử parse trực tiếp
      return JSON.parse(content.trim());
    } catch (err) {
      console.error("❌ Lỗi parse JSON:", err.message);
      return null;
    }
  }
  
  // Cách dùng
  const content = response.choices[0].message.content;
  const tasks = extractJSON(content);
  
  if (tasks) {
    console.log("Tasks parse OK:", tasks);
  } else {
    console.log("Không parse được JSON hợp lệ.");
    throw new Error("AI response is not valid JSON. Please try again.");
  }

  // Lưu vào DB
  const savedTasks = [];
  for (const t of tasks) {
    const task = new Task({
      farmId: farmSchedule.farmId,
      gardenId: farmSchedule.gardenId || null,
      name: t.name,
      description: t.description,
      priority: t.priority || "low",
      startDate: t.startDate ? new Date(t.startDate) : undefined,
      endDate: t.endDate ? new Date(t.endDate) : undefined,
      createdBy: farmSchedule.createdBy,
    });
    await task.save();
    savedTasks.push(task);
  }

  return savedTasks;
};
module.exports = {
  getListPagination,
  getTotal,
  create,
  find,
  update,
  remove,
  generateTasksFromSchedule,
};
