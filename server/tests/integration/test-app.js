require("dotenv").config();
const express = require("express");
const cors = require("cors");
const errorHandler = require("../../middlewares/errorHandler");

const app = express();

// Middleware cơ bản
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Import only essential routes for testing
const authRoutes = require("../../routes/auth.route");
const notificationRoutes = require("../../routes/notification.route");
const farmScheduleRoutes = require("../../routes/farmSchedule.route");

const userRoutes = require("../../routes/admin/user.route");
const farmRoutes = require("../../routes/admin/farm.route");
const gardenRoutes = require("../../routes/admin/garden.route");
const equipmentRoutes = require("../../routes/admin/equipment.route");
const dashboardRoutes = require("../../routes/admin/dashboard.route");
const taskRoutes = require("../../routes/admin/task.route");
const treeRoutes = require("../../routes/admin/tree.route");
const equipmentCategoryRoutes = require("../../routes/admin/equipmentCategory.route");
const equipmentChangeRoutes = require("../../routes/admin/equipmentChange.route");

const webTaskRoutes = require("../../routes/web/task.route");
const webEquipmentRoutes = require("../../routes/web/equipment.route");
const webEquipmentCategoryRoutes = require("../../routes/web/equipmentCategory.route");

// Mount routes
app.use("/auth", authRoutes);
app.use("/notifications", notificationRoutes);
app.use("/farm-schedules", farmScheduleRoutes);

app.use("/admin/users", userRoutes);
app.use("/admin/farms", farmRoutes);
app.use("/admin/gardens", gardenRoutes);
app.use("/admin/equipments", equipmentRoutes);
app.use("/admin/dashboards", dashboardRoutes);
app.use("/admin/tasks", taskRoutes);
app.use("/admin/trees", treeRoutes);
app.use("/admin/equipment-categories", equipmentCategoryRoutes);
app.use("/admin/equipment-changes", equipmentChangeRoutes);

app.use("/web/tasks", webTaskRoutes);
app.use("/web/equipments", webEquipmentRoutes);
app.use("/web/equipment-categories", webEquipmentCategoryRoutes);

// Xử lý lỗi
app.use(errorHandler);

module.exports = app;
