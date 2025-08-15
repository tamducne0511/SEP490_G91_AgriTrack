const authController = require('../../../controllers/auth.controller');
const authService = require('../../../services/auth.service');
const userService = require('../../../services/user.service');
const farmService = require('../../../services/farm.service');
const { validationResult } = require('express-validator');
const { USER_ROLE } = require('../../../constants/app');

// Mock the services
jest.mock('../../../services/auth.service');
jest.mock('../../../services/user.service');
jest.mock('../../../services/farm.service');
jest.mock('express-validator');

describe('Auth Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: {},
      file: null,
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login and return user data with token', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUserData = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          fullName: 'Test User',
          role: 'farmer',
        },
        token: 'mock.jwt.token',
      };

      mockReq.body = loginData;
      authService.login.mockResolvedValue(mockUserData);

      // Act
      await authController.login(mockReq, mockRes, mockNext);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Login successful',
        data: mockUserData,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error when login fails', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const error = new Error('Invalid credentials');

      mockReq.body = loginData;
      authService.login.mockRejectedValue(error);

      // Act
      await authController.login(mockReq, mockRes, mockNext);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      );
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('should return user data for farmer role', async () => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'farmer@example.com',
        fullName: 'Farmer User',
        role: USER_ROLE.farmer,
        farmId: 'farm123',
        password: 'hashedPassword',
      };
      const mockFarm = {
        id: 'farm123',
        name: 'Test Farm',
        address: 'Test Address',
      };

      mockReq.user = { id: 'user123' };
      userService.find.mockResolvedValue(mockUser);
      farmService.find.mockResolvedValue(mockFarm);

      // Act
      await authController.getMe(mockReq, mockRes);

      // Assert
      expect(userService.find).toHaveBeenCalledWith('user123');
      expect(farmService.find).toHaveBeenCalledWith('farm123');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User retrieved successfully',
        data: {
          user: { ...mockUser, password: undefined },
          farm: mockFarm,
        },
      });
    });

    it('should return user data for farm admin role', async () => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: USER_ROLE.farmAdmin,
        farmId: 'farm123',
        password: 'hashedPassword',
      };
      const mockFarm = {
        id: 'farm123',
        name: 'Test Farm',
        address: 'Test Address',
      };

      mockReq.user = { id: 'user123' };
      userService.find.mockResolvedValue(mockUser);
      farmService.find.mockResolvedValue(mockFarm);

      // Act
      await authController.getMe(mockReq, mockRes);

      // Assert
      expect(userService.find).toHaveBeenCalledWith('user123');
      expect(farmService.find).toHaveBeenCalledWith('farm123');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User retrieved successfully',
        data: {
          user: { ...mockUser, password: undefined },
          farm: mockFarm,
        },
      });
    });

    it('should return user data with farms for expert role', async () => {
      // Arrange
      const mockUser = {
        id: 'user123',
        email: 'expert@example.com',
        fullName: 'Expert User',
        role: USER_ROLE.expert,
        password: 'hashedPassword',
      };
      const mockFarms = [
        { id: 'farm1', name: 'Farm 1' },
        { id: 'farm2', name: 'Farm 2' },
      ];

      mockReq.user = { id: 'user123' };
      userService.find.mockResolvedValue(mockUser);
      userService.getListFarmAssignToExpert.mockResolvedValue(mockFarms);

      // Act
      await authController.getMe(mockReq, mockRes);

      // Assert
      expect(userService.find).toHaveBeenCalledWith('user123');
      expect(userService.getListFarmAssignToExpert).toHaveBeenCalledWith('user123');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User retrieved successfully',
        data: {
          user: { ...mockUser, password: undefined },
          farms: mockFarms,
        },
      });
    });

    it('should handle errors and return 500 status', async () => {
      // Arrange
      const error = new Error('Database error');

      mockReq.user = { id: 'user123' };
      userService.find.mockRejectedValue(error);

      // Act
      await authController.getMe(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error retrieving user',
        error: error.message,
      });
    });
  });

  describe('updateProfile', () => {
    it('should successfully update user profile', async () => {
      // Arrange
      const updateData = {
        fullName: 'Updated Name',
        phone: '1234567890',
        address: 'Updated Address',
        gender: 'male',
        birthday: '1990-01-01',
      };
      const mockUpdatedUser = {
        id: 'user123',
        ...updateData,
        avatar: '/uploads/users/avatar.jpg',
      };

      mockReq.user = { id: 'user123' };
      mockReq.body = updateData;
      mockReq.file = { filename: 'avatar.jpg' };
      validationResult.mockReturnValue({ isEmpty: () => true });
      userService.update.mockResolvedValue(mockUpdatedUser);

      // Act
      await authController.updateProfile(mockReq, mockRes, mockNext);

      // Assert
      expect(validationResult).toHaveBeenCalledWith(mockReq);
      expect(userService.update).toHaveBeenCalledWith('user123', {
        ...updateData,
        avatar: '/uploads/users/avatar.jpg',
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        data: mockUpdatedUser,
      });
    });

    it('should handle validation errors', async () => {
      // Arrange
      const validationErrors = [
        { field: 'fullName', message: 'Full name is required' },
      ];

      mockReq.user = { id: 'user123' };
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => validationErrors,
      });

      // Act
      await authController.updateProfile(mockReq, mockRes, mockNext);

      // Assert
      expect(validationResult).toHaveBeenCalledWith(mockReq);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: validationErrors,
      });
      expect(userService.update).not.toHaveBeenCalled();
    });

    it('should handle update errors', async () => {
      // Arrange
      const updateData = {
        fullName: 'Updated Name',
      };
      const error = new Error('Update failed');

      mockReq.user = { id: 'user123' };
      mockReq.body = updateData;
      validationResult.mockReturnValue({ isEmpty: () => true });
      userService.update.mockRejectedValue(error);

      // Act
      await authController.updateProfile(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle profile update without avatar file', async () => {
      // Arrange
      const updateData = {
        fullName: 'Updated Name',
        phone: '1234567890',
      };
      const mockUpdatedUser = {
        id: 'user123',
        ...updateData,
        avatar: '',
      };

      mockReq.user = { id: 'user123' };
      mockReq.body = updateData;
      mockReq.file = null;
      validationResult.mockReturnValue({ isEmpty: () => true });
      userService.update.mockResolvedValue(mockUpdatedUser);

      // Act
      await authController.updateProfile(mockReq, mockRes, mockNext);

      // Assert
      expect(userService.update).toHaveBeenCalledWith('user123', {
        ...updateData,
        avatar: '',
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        data: mockUpdatedUser,
      });
    });
  });

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      // Arrange
      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      };
      const mockUpdatedUser = {
        id: 'user123',
        email: 'test@example.com',
      };

      mockReq.user = { id: 'user123' };
      mockReq.body = passwordData;
      validationResult.mockReturnValue({ isEmpty: () => true });
      authService.changePassword.mockResolvedValue(mockUpdatedUser);

      // Act
      await authController.changePassword(mockReq, mockRes, mockNext);

      // Assert
      expect(validationResult).toHaveBeenCalledWith(mockReq);
      expect(authService.changePassword).toHaveBeenCalledWith(
        'user123',
        passwordData.currentPassword,
        passwordData.newPassword
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Password changed successfully',
        data: mockUpdatedUser,
      });
    });

    it('should handle validation errors for password change', async () => {
      // Arrange
      const validationErrors = [
        { field: 'currentPassword', message: 'Current password is required' },
      ];

      mockReq.user = { id: 'user123' };
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => validationErrors,
      });

      // Act
      await authController.changePassword(mockReq, mockRes, mockNext);

      // Assert
      expect(validationResult).toHaveBeenCalledWith(mockReq);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: validationErrors,
      });
      expect(authService.changePassword).not.toHaveBeenCalled();
    });

    it('should handle password change errors', async () => {
      // Arrange
      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      };
      const error = new Error('Password change failed');

      mockReq.user = { id: 'user123' };
      mockReq.body = passwordData;
      validationResult.mockReturnValue({ isEmpty: () => true });
      authService.changePassword.mockRejectedValue(error);

      // Act
      await authController.changePassword(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
