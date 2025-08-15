const authService = require('../../../services/auth.service');
const User = require('../../../models/user.model');
const BadRequestException = require('../../../middlewares/exceptions/badrequest');
const { hashPassword } = require('../../../utils/auth.util');

// Mock the auth utilities
jest.mock('../../../utils/auth.util', () => ({
  comparePassword: jest.fn(),
  generateToken: jest.fn(),
  hashPassword: jest.fn(),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';
      
      const mockUser = {
        _id: 'user123',
        email,
        fullName: 'Test User',
        password: hashedPassword,
        role: 'farmer',
        farmId: 'farm123',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: true
      };

      const mockToken = 'mock.jwt.token';
      const mockUserInfo = {
        id: mockUser._id,
        fullName: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
        farmId: mockUser.farmId,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      // Mock User.findOne to return a user
      User.findOne = jest.fn().mockResolvedValue(mockUser);
      
      // Mock comparePassword to return true
      const { comparePassword } = require('../../../utils/auth.util');
      comparePassword.mockResolvedValue(true);
      
      // Mock generateToken to return a token
      const { generateToken } = require('../../../utils/auth.util');
      generateToken.mockReturnValue(mockToken);

      // Act
      const result = await authService.login(email, password);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        email,
        status: true,
      });
      expect(comparePassword).toHaveBeenCalledWith(password, hashedPassword);
      expect(generateToken).toHaveBeenCalledWith(mockUserInfo);
      expect(result).toEqual({
        user: mockUserInfo,
        token: mockToken,
      });
    });

    it('should throw BadRequestException when user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';

      // Mock User.findOne to return null
      User.findOne = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow(
        BadRequestException
      );
      await expect(authService.login(email, password)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should throw BadRequestException when user is inactive', async () => {
      // Arrange
      const email = 'inactive@example.com';
      const password = 'password123';

      // Mock User.findOne to return null for inactive user (since query includes status: true)
      User.findOne = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow(
        BadRequestException
      );
      await expect(authService.login(email, password)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should throw BadRequestException when password is incorrect', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = 'hashedPassword123';

      const mockUser = {
        _id: 'user123',
        email,
        password: hashedPassword,
        status: true,
      };

      // Mock User.findOne to return a user
      User.findOne = jest.fn().mockResolvedValue(mockUser);
      
      // Mock comparePassword to return false
      const { comparePassword } = require('../../../utils/auth.util');
      comparePassword.mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow(
        BadRequestException
      );
      await expect(authService.login(email, password)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const dbError = new Error('Database connection failed');

      // Mock User.findOne to throw an error
      User.findOne = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow(dbError);
    });
  });

  describe('changePassword', () => {
    it('should successfully change password with valid current password', async () => {
      // Arrange
      const userId = 'user123';
      const currentPassword = 'oldpassword';
      const newPassword = 'newpassword';
      const hashedNewPassword = 'hashedNewPassword';

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        password: 'hashedOldPassword',
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock User.findById to return a user
      User.findById = jest.fn().mockResolvedValue(mockUser);
      
      // Mock comparePassword to return true for current password
      const { comparePassword } = require('../../../utils/auth.util');
      comparePassword.mockResolvedValue(true);
      
      // Mock hashPassword to return hashed new password
      hashPassword.mockResolvedValue(hashedNewPassword);

      // Act
      const result = await authService.changePassword(userId, currentPassword, newPassword);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(comparePassword).toHaveBeenCalledWith(currentPassword, 'hashedOldPassword');
      expect(hashPassword).toHaveBeenCalledWith(newPassword);
      expect(mockUser.password).toBe(hashedNewPassword);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toBe(mockUser);
    });

    it('should throw BadRequestException when user not found', async () => {
      // Arrange
      const userId = 'nonexistent';
      const currentPassword = 'oldpassword';
      const newPassword = 'newpassword';

      // Mock User.findById to return null
      User.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow(BadRequestException);
      await expect(
        authService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow('User not found');
    });

    it('should throw BadRequestException when current password is incorrect', async () => {
      // Arrange
      const userId = 'user123';
      const currentPassword = 'wrongpassword';
      const newPassword = 'newpassword';

      const mockUser = {
        _id: userId,
        password: 'hashedOldPassword',
      };

      // Mock User.findById to return a user
      User.findById = jest.fn().mockResolvedValue(mockUser);
      
      // Mock comparePassword to return false
      const { comparePassword } = require('../../../utils/auth.util');
      comparePassword.mockResolvedValue(false);

      // Act & Assert
      await expect(
        authService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow(BadRequestException);
      await expect(
        authService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should throw BadRequestException when new password is same as current password', async () => {
      // Arrange
      const userId = 'user123';
      const currentPassword = 'samepassword';
      const newPassword = 'samepassword';

      const mockUser = {
        _id: userId,
        password: 'hashedPassword',
      };

      // Mock User.findById to return a user
      User.findById = jest.fn().mockResolvedValue(mockUser);
      
      // Mock comparePassword to return true
      const { comparePassword } = require('../../../utils/auth.util');
      comparePassword.mockResolvedValue(true);

      // Act & Assert
      await expect(
        authService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow(BadRequestException);
      await expect(
        authService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow('New password must be different from current password');
    });

    it('should handle save errors gracefully', async () => {
      // Arrange
      const userId = 'user123';
      const currentPassword = 'oldpassword';
      const newPassword = 'newpassword';
      const saveError = new Error('Save failed');

      const mockUser = {
        _id: userId,
        password: 'hashedOldPassword',
        save: jest.fn().mockRejectedValue(saveError),
      };

      // Mock User.findById to return a user
      User.findById = jest.fn().mockResolvedValue(mockUser);
      
      // Mock comparePassword to return true
      const { comparePassword } = require('../../../utils/auth.util');
      comparePassword.mockResolvedValue(true);
      
      // Mock hashPassword to return hashed new password
      hashPassword.mockResolvedValue('hashedNewPassword');

      // Act & Assert
      await expect(
        authService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow(saveError);
    });
  });
});
