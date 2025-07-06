const isLogin = require('../../middlewares/isLogin.middleware');
const { verifyToken } = require('../../utils/auth.util');

// Mock the auth util
jest.mock('../../utils/auth.util');

describe('isLogin Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() with valid Bearer token', () => {
    const mockDecoded = { id: '1', email: 'test@example.com', role: 'farmer' };
    mockReq.headers.authorization = 'Bearer valid-token';
    verifyToken.mockReturnValue(mockDecoded);

    isLogin(mockReq, mockRes, mockNext);

    expect(verifyToken).toHaveBeenCalledWith('valid-token');
    expect(mockReq.user).toEqual(mockDecoded);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 401 when no authorization header', () => {
    isLogin(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorization' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header does not start with Bearer', () => {
    mockReq.headers.authorization = 'Invalid valid-token';

    isLogin(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorization' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when token verification fails', () => {
    mockReq.headers.authorization = 'Bearer invalid-token';
    verifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    isLogin(mockReq, mockRes, mockNext);

    expect(verifyToken).toHaveBeenCalledWith('invalid-token');
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorization' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle empty authorization header', () => {
    mockReq.headers.authorization = '';

    isLogin(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorization' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle authorization header with only Bearer', () => {
    mockReq.headers.authorization = 'Bearer ';

    isLogin(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorization' });
    expect(mockNext).not.toHaveBeenCalled();
  });
}); 