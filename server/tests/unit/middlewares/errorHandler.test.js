const errorHandler = require("../../../middlewares/errorHandler");

describe("Error Handler Middleware", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it("should handle BadRequestException with 400 status", () => {
    // Arrange
    const error = new Error("Bad Request");
    error.name = "BadRequestException";
    error.statusCode = 400;

    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "BadRequestException",
      message: "Bad Request",
    });
  });

  it("should handle NotFoundException with 404 status", () => {
    // Arrange
    const error = new Error("Not Found");
    error.name = "NotFoundException";
    error.statusCode = 404;

    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "NotFoundException",
      message: "Not Found",
    });
  });

  it("should handle ValidationError with 422 status", () => {
    // Arrange
    const error = new Error("Validation Error");
    error.name = "ValidationError";
    error.statusCode = 422;

    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(422);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "ValidationError",
      message: "Validation Error",
    });
  });

  it("should handle UnauthorizedError with 401 status", () => {
    // Arrange
    const error = new Error("Unauthorized");
    error.name = "UnauthorizedError";
    error.statusCode = 401;

    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "UnauthorizedError",
      message: "Unauthorized",
    });
  });

  it("should handle ForbiddenError with 403 status", () => {
    // Arrange
    const error = new Error("Forbidden");
    error.name = "ForbiddenError";
    error.statusCode = 403;

    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "ForbiddenError",
      message: "Forbidden",
    });
  });

  it("should handle generic Error with 500 status", () => {
    // Arrange
    const error = new Error("Internal Server Error");

    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Error",
      message: "Internal Server Error",
    });
  });

  it("should handle error without name property", () => {
    // Arrange
    const error = { message: "Test error", statusCode: 400 };

    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Error",
      message: "Test error",
    });
  });

  it("should handle error without message property", () => {
    // Arrange
    const error = { name: "CustomError", statusCode: 400 };

    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "CustomError",
      message: "Internal Server Error",
    });
  });

  it("should handle error without statusCode property", () => {
    // Arrange
    const error = { name: "CustomError", message: "Test error" };

    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "CustomError",
      message: "Test error",
    });
  });

  it("should handle error with custom status code", () => {
    // Arrange
    const error = { name: "CustomError", message: "Test error", statusCode: 418 };

    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(418);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "CustomError",
      message: "Test error",
    });
  });

  it("should handle null error gracefully", () => {
    // Arrange
    const error = null;

    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Error",
      message: "Internal Server Error",
    });
  });

  it("should handle undefined error gracefully", () => {
    // Arrange
    const error = undefined;

    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Error",
      message: "Internal Server Error",
    });
  });

  it("should handle error with empty string message", () => {
    // Arrange
    const error = { name: "CustomError", message: "", statusCode: 400 };

    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "CustomError",
      message: "Internal Server Error",
    });
  });

  it("should handle error with whitespace-only message", () => {
    // Arrange
    const error = { name: "CustomError", message: "   ", statusCode: 400 };

    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "CustomError",
      message: "Internal Server Error",
    });
  });
});
