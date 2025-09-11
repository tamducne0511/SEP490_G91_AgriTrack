const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;

  if (err.message === "Only upload images (jpeg, jpg, png, gif)") {
    return res.status(400).json({ message: err.message });
  }

  res.status(status).json({
    error: err.name || "Error",
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
