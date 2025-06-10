const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;

  res.status(status).json({
    error: err.name || "Error",
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
