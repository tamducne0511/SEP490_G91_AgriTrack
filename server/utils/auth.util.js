const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function hashPassword(plainPassword) {
  const saltRounds = 10;
  const hashed = await bcrypt.hash(plainPassword, saltRounds);
  return hashed;
}

async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

function generateToken(user) {
  console.log("🔍 AuthUtil: Generating token for user:", user.email);
  console.log("🔍 AuthUtil: JWT_SECRET configured:", process.env.JWT_SECRET ? "Yes" : "No");
  
  if (!process.env.JWT_SECRET) {
    console.error("❌ AuthUtil: JWT_SECRET is not configured!");
    throw new Error("JWT_SECRET is not configured");
  }
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, farmId: user.farmId },
    process.env.JWT_SECRET,
    { expiresIn: "20d" }
  );
  
  console.log("🔍 AuthUtil: Token generated successfully");
  return token;
}

function verifyToken(token) {
  console.log("🔍 AuthUtil: Verifying token");
  if (!process.env.JWT_SECRET) {
    console.error("❌ AuthUtil: JWT_SECRET is not configured for verification!");
    throw new Error("JWT_SECRET is not configured");
  }
  
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
};
