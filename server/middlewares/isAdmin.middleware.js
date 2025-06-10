const { USER_ROLE } = require("../constants/app");
const { verifyToken } = require("../utils/auth.util");

function isAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorization" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    if (decoded.role !== USER_ROLE.admin) {
      return res.status(401).json({ message: "Unauthorization" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorization" });
  }
}

module.exports = isAdmin;
