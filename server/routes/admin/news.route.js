const express = require("express");
const router = express.Router();
const newsController = require("../../controllers/admin/news.controller");
const isLogin = require("../../middlewares/isLogin.middleware");
const isExpert = require("../../middlewares/isExpert.middleware");
const uploadWithFolder = require("../../middlewares/uploadFile");
const { createNewsValidator, updateNewsValidator } = require("../../middlewares/validators/news.validator");

// Public routes (all authenticated users can view)
router.get("/", isLogin, newsController.getAllNews);
router.get("/published", isLogin, newsController.getPublishedNews);
router.get("/status/:status", isLogin, newsController.getNewsByStatus);

// Expert-only routes (create, update, delete)
router.post("/", isLogin, isExpert, uploadWithFolder("news").single("image"), createNewsValidator, newsController.createNews);
router.put("/:id", isLogin, isExpert, uploadWithFolder("news").single("image"), updateNewsValidator, newsController.updateNews);
router.delete("/:id", isLogin, isExpert, newsController.deleteNews);

// Expert's own news (must come before /:id route)
router.get("/my/news", isLogin, isExpert, newsController.getMyNews);

// Get news by ID (must come last to avoid conflicts)
router.get("/:id", isLogin, newsController.getNewsById);

module.exports = router;
