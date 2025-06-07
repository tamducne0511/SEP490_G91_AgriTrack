const User = require("../models/user.model");
const BadRequestException = require("../middlewares/exceptions/badrequest");
const { USER_ROLE } = require("../constants/app");
const { comparePassword, generateToken } = require("../utils/auth.util");

const login = async (email, password) => {
  const user = await User.findOne({
    email,
    status: true,
    role: { $in: [USER_ROLE.admin, USER_ROLE.farmAdmin, USER_ROLE.expert] },
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

module.exports = {
  login,
};
