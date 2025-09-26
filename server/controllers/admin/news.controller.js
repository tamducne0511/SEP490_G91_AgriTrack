const newsService = require("../../services/news.service");
const { validationResult } = require("express-validator");

// Get all news (with pagination and filters)
const getAllNews = async (req, res, next) => {
  try {
    const { page, limit, status, search, authorId } = req.query;
    const filters = { page, limit, status, search, authorId };
    
    const result = await newsService.findAll(filters);
    
    res.json({
      message: "News retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Get news by ID
const getNewsById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const news = await newsService.findById(id);
    
    res.json({
      message: "News retrieved successfully",
      data: news,
    });
  } catch (error) {
    next(error);
  }
};

// Create new news (Expert only)
const createNews = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, status } = req.body;
    const authorId = req.user.id; // Expert who is creating the news
    
    const newsData = {
      title,
      content,
      status: status || "draft",
      authorId,
      image: req.file?.filename ? `/uploads/news/${req.file.filename}` : null,
    };

    const news = await newsService.create(newsData);
    
    res.status(201).json({
      message: "News created successfully",
      data: news,
    });
  } catch (error) {
    next(error);
  }
};

// Update news (Expert only - can only update their own news)
const updateNews = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, content, status, removeImage } = req.body;
    const authorId = req.user.id;

    // First check if news exists and belongs to the expert
    const existingNews = await newsService.findById(id);
    if (existingNews.authorId._id.toString() !== authorId) {
      return res.status(403).json({
        message: "You can only update your own news",
      });
    }

    const updateData = {
      title,
      content,
      status,
    };

    // Add image if uploaded, or remove if requested
    if (req.file?.filename) {
      updateData.image = `/uploads/news/${req.file.filename}`;
    } else if (typeof removeImage !== "undefined") {
      const shouldRemove = removeImage === true || removeImage === "true";
      if (shouldRemove) {
        updateData.image = null;
      }
    }

    const news = await newsService.update(id, updateData);
    
    res.json({
      message: "News updated successfully",
      data: news,
    });
  } catch (error) {
    next(error);
  }
};

// Delete news (Expert only - can only delete their own news)
const deleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authorId = req.user.id;

    // First check if news exists and belongs to the expert
    const existingNews = await newsService.findById(id);
    if (existingNews.authorId._id.toString() !== authorId) {
      return res.status(403).json({
        message: "You can only delete your own news",
      });
    }

    await newsService.remove(id);
    
    res.json({
      message: "News deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get published news (for public viewing)
const getPublishedNews = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const news = await newsService.getPublishedNews(parseInt(limit));
    
    res.json({
      message: "Published news retrieved successfully",
      data: news,
    });
  } catch (error) {
    next(error);
  }
};

// Get news by status
const getNewsByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const news = await newsService.findByStatus(status);
    
    res.json({
      message: `${status} news retrieved successfully`,
      data: news,
    });
  } catch (error) {
    next(error);
  }
};

// Get news by current expert author
const getMyNews = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const authorId = req.user.id;
    const filters = { page, limit, status };
    
    const result = await newsService.getNewsByAuthor(authorId, filters);
    
    res.json({
      message: "Your news retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getPublishedNews,
  getNewsByStatus,
  getMyNews,
};
