const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../../models/user.model');

// Create a test user with default values
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
    phone: '1234567890',
    address: 'Test Address',
    gender: 'male',
    birthday: '1990-01-01',
    role: 'farmer',
    farmId: null,
    avatar: '',
    ...userData
  };

  // Handle farmId properly - if it's a string, convert to ObjectId
  if (defaultUser.farmId && typeof defaultUser.farmId === 'string') {
    defaultUser.farmId = new mongoose.Types.ObjectId(defaultUser.farmId);
  }

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(defaultUser.password, saltRounds);
  
  const user = new User({
    ...defaultUser,
    password: hashedPassword
  });

  return await user.save();
};

// Generate JWT token for a user
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

// Create authenticated request headers
const getAuthHeaders = (token) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Mock file upload for testing
const mockFileUpload = (filename = 'test-image.jpg') => {
  return {
    fieldname: 'avatar',
    originalname: filename,
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
    size: 1024
  };
};

// Create test data for different entities
const createTestFarm = () => ({
  name: 'Test Farm',
  address: 'Test Farm Address',
  area: 100,
  description: 'Test farm description'
});

const createTestGarden = (farmId) => ({
  name: 'Test Garden',
  farmId: farmId,
  area: 50,
  description: 'Test garden description'
});

const createTestTask = (farmId, assignedTo) => ({
  title: 'Test Task',
  description: 'Test task description',
  farmId: farmId,
  assignedTo: assignedTo,
  status: 'pending',
  priority: 'medium',
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
});

// Create a valid ObjectId string
const createObjectId = () => new mongoose.Types.ObjectId().toString();

// Create test farm with proper ObjectId
const createTestFarmWithId = () => ({
  _id: new mongoose.Types.ObjectId(),
  name: 'Test Farm',
  address: 'Test Farm Address',
  area: 100,
  description: 'Test farm description'
});

module.exports = {
  createTestUser,
  generateToken,
  getAuthHeaders,
  mockFileUpload,
  createTestFarm,
  createTestGarden,
  createTestTask,
  createObjectId,
  createTestFarmWithId
}; 