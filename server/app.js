const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.route");
const notificationRoutes = require("./routes/notification.route");
const farmRoutes = require("./routes/admin/farm.route");
const userRoutes = require("./routes/admin/user.route");
const gardenRoutes = require("./routes/admin/garden.route");
const dashboardRoutes = require("./routes/admin/dashboard.route");
const equipmentRoutes = require("./routes/admin/equipment.route");
const taskRoutes = require("./routes/admin/task.route");
const equipmentCategoryRoutes = require("./routes/admin/equipmentCategory.route");
const equipmentChangeRoutes = require("./routes/admin/equipmentChange.route");
const equipmentCategoryWebRoutes = require("./routes/web/equipmentCategory.route");
const equipmentWebRoutes = require("./routes/web/equipment.route");
const treeRoutes = require("./routes/admin/tree.route");

const taskWebRoutes = require("./routes/web/task.route");

const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/auth", authRoutes);
app.use("/notifications", notificationRoutes);
app.use("/admin/users", userRoutes);
app.use("/admin/farms", farmRoutes);
app.use("/admin/gardens", gardenRoutes);
app.use("/admin/equipments", equipmentRoutes);
app.use("/admin/dashboards", dashboardRoutes);
app.use("/admin/tasks", taskRoutes);
app.use("/admin/trees", treeRoutes);
app.use("/admin/equipment-categories", equipmentCategoryRoutes);
app.use("/admin/equipment-changes", equipmentChangeRoutes);

app.use("/web/tasks", taskWebRoutes);
app.use("/web/equipments", equipmentWebRoutes);
app.use("/web/equipment-categories", equipmentCategoryWebRoutes);

app.use(errorHandler);

module.exports = app;