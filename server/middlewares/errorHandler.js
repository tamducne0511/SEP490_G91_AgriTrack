const errorHandler = (err, req, res, next) => {
  // Handle null/undefined errors
  if (!err) {
    return res.status(500).json({
      error: "Error",
      message: "Internal Server Error",
    });
  }

  const status = err.statusCode || 500;
  
  // Handle empty or whitespace-only messages
  let message = err.message || "Internal Server Error";
  if (!message || message.trim() === "") {
    message = "Internal Server Error";
  }

  res.status(status).json({
    error: err.name || "Error",
    message: message,
  });
};

module.exports = errorHandler;
