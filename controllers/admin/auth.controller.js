const authService = require("../../services/auth.service");

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    res.json({
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
};
