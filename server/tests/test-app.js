require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const errorHandler = require("../middlewares/errorHandler");

// Create test app without database connection
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  }
});

// Gắn socket.io vào export global
global.io = io;
module.exports.io = io;

// Middleware cơ bản
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Gom các route theo nhóm logic
const commonRoutes = [
  { path: "/auth", route: require("../routes/auth.route") },
  { path: "/notifications", route: require("../routes/notification.route") },
  { path: "/question-notifications", route: require("../routes/questionNotification.route") },
  { path: "/farm-schedules", route: require("../routes/farmSchedule.route") },
  { path: "/task-questions", route: require("../routes/taskQuestion.route") }
];

const adminRoutes = [
  { path: "/users", route: require("../routes/admin/user.route") },
  { path: "/farms", route: require("../routes/admin/farm.route") },
  { path: "/gardens", route: require("../routes/admin/garden.route") },
  { path: "/equipments", route: require("../routes/admin/equipment.route") },
  { path: "/dashboards", route: require("../routes/admin/dashboard.route") },
  { path: "/tasks", route: require("../routes/admin/task.route") },
  { path: "/trees", route: require("../routes/admin/tree.route") },
  { path: "/equipment-categories", route: require("../routes/admin/equipmentCategory.route") },
  { path: "/equipment-changes", route: require("../routes/admin/equipmentChange.route") },
  { path: "/news", route: require("../routes/admin/news.route") }
];

const webRoutes = [
  { path: "/tasks", route: require("../routes/web/task.route") },
  { path: "/equipments", route: require("../routes/web/equipment.route") },
  { path: "/equipment-categories", route: require("../routes/web/equipmentCategory.route") }
];

// Gắn route tự động
commonRoutes.forEach(r => app.use(r.path, r.route));
adminRoutes.forEach(r => app.use("/admin" + r.path, r.route));
webRoutes.forEach(r => app.use("/web" + r.path, r.route));

// Xử lý lỗi
app.use(errorHandler);

module.exports = app;
