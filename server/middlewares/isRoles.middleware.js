const { verifyToken } = require("../utils/auth.util");

function isRoles(roles) {
  return function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorization" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = verifyToken(token);
      if (!roles.includes(decoded.role)) {
        return res.status(401).json({ message: "Unauthorization" });
      }

      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Unauthorization" });
    }
  };
}

module.exports = isRoles;
