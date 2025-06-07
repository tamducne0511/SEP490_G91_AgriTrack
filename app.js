const express = require("express");
const authRoutes = require("./routes/admin/auth.route");
const notificationRoutes = require("./routes/admin/notification.route");
const farmRoutes = require("./routes/admin/farm.route");
const userRoutes = require("./routes/admin/user.route");
const gardenRoutes = require("./routes/admin/garden.route");
const equipmentRoutes = require("./routes/admin/equipment.route");
const taskRoutes = require("./routes/admin/task.route");
const equipmentCategoryRoutes = require("./routes/admin/equipmentCategory.route");
const equipmentChangeRoutes = require("./routes/admin/equipmentChange.route");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/admin/auth", authRoutes);
app.use("/admin/notifications", notificationRoutes);
app.use("/admin/users", userRoutes);
app.use("/admin/farms", farmRoutes);
app.use("/admin/gardens", gardenRoutes);
app.use("/admin/equipments", equipmentRoutes);
app.use("/admin/tasks", taskRoutes);
app.use("/admin/equipment-categories", equipmentCategoryRoutes);
app.use("/admin/equipment-changes", equipmentChangeRoutes);

app.use(errorHandler);

module.exports = app;
