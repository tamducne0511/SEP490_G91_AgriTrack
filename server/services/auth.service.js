const User = require("../models/user.model");
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

  const userInfo = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    farmId: user.farmId,
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
