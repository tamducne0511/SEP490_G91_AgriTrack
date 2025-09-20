const News = require("../models/news.model");
const User = require("../models/user.model");
const NotFoundException = require("../middlewares/exceptions/notfound");

const create = async (data) => {
  const news = new News(data);
  return await news.save();
};

const findAll = async (filters = {}) => {
  const { page = 1, limit = 10, status, search, authorId } = filters;
  
  let query = {};
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  // Filter by author
  if (authorId) {
    query.authorId = authorId;
  }
  
  // Search in title and content
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } }
    ];
  }

  const skip = (page - 1) * limit;
  
  const [news, total] = await Promise.all([
    News.find(query)
      .populate("authorId", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    News.countDocuments(query)
  ]);

  return {
    data: news,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const findById = async (id) => {
  const news = await News.findById(id).populate("authorId", "fullName email");
  if (!news) {
    throw new NotFoundException("News not found");
  }
  return news;
};

const update = async (id, data) => {
  const news = await News.findByIdAndUpdate(
    id,
    { ...data, updatedAt: Date.now() },
    { new: true, runValidators: true }
  ).populate("authorId", "fullName email");
  
  if (!news) {
    throw new NotFoundException("News not found");
  }
  return news;
};

const remove = async (id) => {
  const news = await News.findByIdAndDelete(id);
  if (!news) {
    throw new NotFoundException("News not found");
  }
  return news;
};

const findByStatus = async (status) => {
  return await News.find({ status })
    .populate("authorId", "fullName email")
    .sort({ createdAt: -1 });
};

const getPublishedNews = async (limit = 10) => {
  return await News.find({ status: "published" })
    .populate("authorId", "fullName email")
    .sort({ createdAt: -1 })
    .limit(limit);
};

const getNewsByAuthor = async (authorId, filters = {}) => {
  const { page = 1, limit = 10, status } = filters;
  
  let query = { authorId };
  
  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;
  
  const [news, total] = await Promise.all([
    News.find(query)
      .populate("authorId", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    News.countDocuments(query)
  ]);

  return {
    data: news,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove,
  findByStatus,
  getPublishedNews,
  getNewsByAuthor,
};
