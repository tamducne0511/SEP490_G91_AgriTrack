const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
  // Tham chiếu danh mục thiết bị
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EquipmentCategory",
    required: true,
  },

  // Tham chiếu nông trại sở hữu thiết bị
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
    required: true,
  },

  // Tên thiết bị
  name: {
    type: String,
    required: true,
  },

  // Đường dẫn ảnh thiết bị (tùy chọn)
  image: {
    type: String,
    // required: true,
  },

  // Số lượng hiện có
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },

  // Mô tả chi tiết
  description: {
    type: String,
    required: true,
  },

  // Trạng thái hoạt động (xóa mềm = false)
  status: {
    type: Boolean,
    default: true,
  },

  // Thời điểm tạo
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Thời điểm cập nhật gần nhất
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Equipment = mongoose.model("Equipment", equipmentSchema);

module.exports = Equipment;
