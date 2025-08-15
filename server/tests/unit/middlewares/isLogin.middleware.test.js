const isLogin = require('../../../middlewares/isLogin.middleware');
const { verifyToken } = require('../../../utils/auth.util');

// Mock the auth utilities
jest.mock('../../../utils/auth.util', () => ({
  verifyToken: jest.fn(),
}));

describe('isLogin Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() when valid token is provided', () => {
    // Arrange
    const mockDecodedUser = {
      id: 'user123',
      email: 'test@example.com',
      role: 'farmer',
    };

    mockReq.headers.authorization = 'Bearer valid.token.here';
    verifyToken.mockReturnValue(mockDecodedUser);

    // Act
    isLogin(mockReq, mockRes, mockNext);

    // Assert
    expect(verifyToken).toHaveBeenCalledWith('valid.token.here');
    expect(mockReq.user).toEqual(mockDecodedUser);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('should return 401 when no authorization header is provided', () => {
    // Arrange
    mockReq.headers.authorization = undefined;

    // Act
    isLogin(mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Unauthorization',
    });
    expect(mockNext).not.toHaveBeenCalled();
    expect(verifyToken).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header does not start with Bearer', () => {
    // Arrange
    mockReq.headers.authorization = 'InvalidToken';

    // Act
    isLogin(mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Unauthorization',
    });
    expect(mockNext).not.toHaveBeenCalled();
    expect(verifyToken).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header starts with Bearer but has no token', () => {
    // Arrange
    mockReq.headers.authorization = 'Bearer ';
    // The middleware will try to verify an empty token, which should fail
    verifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    // Act
    isLogin(mockReq, mockRes, mockNext);

    // Assert
    expect(verifyToken).toHaveBeenCalledWith('');
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Unauthorization',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when token verification fails', () => {
    // Arrange
    const tokenError = new Error('Invalid token');
    mockReq.headers.authorization = 'Bearer invalid.token.here';
    verifyToken.mockImplementation(() => {
      throw tokenError;
    });

    // Act
    isLogin(mockReq, mockRes, mockNext);

    // Assert
    expect(verifyToken).toHaveBeenCalledWith('invalid.token.here');
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Unauthorization',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle token with extra spaces', () => {
    // Arrange
    const mockDecodedUser = {
      id: 'user123',
      email: 'test@example.com',
      role: 'farmer',
    };

    mockReq.headers.authorization = 'Bearer  valid.token.here  ';
    // The middleware splits on spaces and takes the second element: 'valid.token.here'
    verifyToken.mockReturnValue(mockDecodedUser);

    // Act
    isLogin(mockReq, mockRes, mockNext);

    // Assert
    expect(verifyToken).toHaveBeenCalledWith('valid.token.here');
    expect(mockReq.user).toEqual(mockDecodedUser);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle complex token structure', () => {
    // Arrange
    const mockDecodedUser = {
      id: 'user123',
      email: 'test@example.com',
      role: 'expert',
      farmId: 'farm123',
    };

    const complexToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    mockReq.headers.authorization = `Bearer ${complexToken}`;
    verifyToken.mockReturnValue(mockDecodedUser);

    // Act
    isLogin(mockReq, mockRes, mockNext);

    // Assert
    expect(verifyToken).toHaveBeenCalledWith(complexToken);
    expect(mockReq.user).toEqual(mockDecodedUser);
    expect(mockNext).toHaveBeenCalled();
  });
});
