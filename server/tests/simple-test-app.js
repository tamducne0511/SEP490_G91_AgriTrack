require("dotenv").config();
const express = require("express");
const cors = require("cors");
const errorHandler = require("../middlewares/errorHandler");

// Create simple test app with only news routes
const app = express();

// Middleware cơ bản
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Only include news routes for testing
const newsRoute = require("../routes/admin/news.route");
app.use("/admin/news", newsRoute);

// Xử lý lỗi
app.use(errorHandler);

module.exports = app;
