const User = require("../models/user.model");
const BadRequestException = require("../middlewares/exceptions/badrequest");
const {
  comparePassword,
  generateToken,
  hashPassword,
} = require("../utils/auth.util");

const login = async (email, password) => {
  console.log("🔍 AuthService: Starting login process for email:", email);
  
  const user = await User.findOne({
    email,
    status: true,
  });

  console.log("🔍 AuthService: User found:", user ? "Yes" : "No");

  if (!user) {
    console.log("❌ AuthService: User not found or inactive");
    throw new BadRequestException("Invalid email or password");
  }

  console.log("🔍 AuthService: Comparing passwords");
  if (!(await comparePassword(password, user.password))) {
    console.log("❌ AuthService: Password comparison failed");
    throw new BadRequestException("Invalid email or password");
  }

  console.log("🔍 AuthService: Password verified, generating token");
  const userInfo = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    farmId: user.farmId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  const token = generateToken(userInfo);
  console.log("🔍 AuthService: Token generated successfully");

  return {
    user: userInfo,
    token: token,
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
