const User = require("../models/user.model");
const ExpertFarm = require("../models/expertFarm.model");
const BadRequestException = require("../middlewares/exceptions/badrequest");
const {
  comparePassword,
  generateToken,
  hashPassword,
} = require("../utils/auth.util");

const login = async (email, password) => {
  const user = await User.findOne({
    email,
    status: true,
  });

  if (!user) {
    throw new BadRequestException("Invalid email or password");
  }

  if (!(await comparePassword(password, user.password))) {
    throw new BadRequestException("Invalid email or password");
  }
  let farmIds = [];

  // Nếu là expert thì lấy danh sách farm từ bảng expertFarms
  if (user.role === "expert") {
    const expertFarms = await ExpertFarm.find({ expertId: user._id }).select("farmId");
    farmIds = expertFarms.map((ef) => ef.farmId);
  }
  const userInfo = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    farmId: user.role === "expert" ? farmIds : user.farmId, // expert có nhiều farm
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return {
    user: userInfo,
    token: generateToken(userInfo),
  };
};

// Change password
const changePassword = async (id, currentPassword, newPassword) => {
  const user = await User.findById(id);
  if (!user) {
    throw new BadRequestException("User not found");
  }

  if (!(await comparePassword(currentPassword, user.password))) {
    throw new BadRequestException("Current password is incorrect");
  }

  if (currentPassword === newPassword) {
    throw new BadRequestException(
      "New password must be different from current password"
    );
  }

  user.password = await hashPassword(newPassword);
  await user.save();
  return user;
};

module.exports = {
  login,
  changePassword,
};
