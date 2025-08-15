const authService = require("../services/auth.service");
const userService = require("../services/user.service");
const farmService = require("../services/farm.service");
const { validationResult } = require("express-validator");
const { USER_ROLE } = require("../constants/app");

// Login
const login = async (req, res, next) => {
  try {
    console.log("🔍 AuthController: Login request received");
    const { email, password } = req.body;
    console.log("🔍 AuthController: Login credentials:", { email, password: password ? "***" : "undefined" });
    
    const user = await authService.login(email, password);
    console.log("🔍 AuthController: Login successful for user:", user.user.email);
    
    res.json({
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    console.error("❌ AuthController: Login error:", error.message);
    next(error);
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    console.log("🔍 AuthController: GetMe request received for user ID:", req.user.id);
    const response = {};
    const user = await userService.find(req.user.id);
    response.user = user;

    if (user.role === USER_ROLE.expert) {
      response.farms = await await userService.getListFarmAssignToExpert(
        user.id
      );
    } else if (
      user.role === USER_ROLE.farmer ||
      user.role === USER_ROLE.farmAdmin
    ) {
      response.farm = await farmService.find(user.farmId);
    }

    user.password = undefined;
    console.log("🔍 AuthController: GetMe successful for user:", user.email);
    res.json({
      message: "User retrieved successfully",
      data: response,
    });
  } catch (error) {
    console.error("❌ AuthController: GetMe error:", error.message);
    res.status(500).json({
      message: "Error retrieving user",
      error: error.message,
    });
  }
};

// Update profile
const updateProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user.id;
    const { fullName, phone, address, gender, birthday } = req.body;
    const user = await userService.update(userId, {
      fullName,
      phone,
      address,
      gender,
      birthday,
      avatar: req.file?.filename ? `/uploads/users/${req.file.filename}` : "",
    });
    res.json({
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const user = await authService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    res.json({
      message: "Password changed successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  updateProfile,
  changePassword,
};
