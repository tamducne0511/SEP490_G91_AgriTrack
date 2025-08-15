const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-for-integration-tests';

let mongod;

// Setup MongoDB Memory Server before all tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Close database connection and stop MongoDB Memory Server after all tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});

// Global test utilities
global.testUtils = {
  // Helper to create test user data
  createTestUser: (overrides = {}) => ({
    email: 'test@example.com',
    fullName: 'Test User',
    password: 'password123',
    role: 'farmer',
    status: true,
    ...overrides
  }),

  // Helper to create test farm data
  createTestFarm: (overrides = {}) => ({
    name: 'Test Farm',
    address: 'Test Address',
    area: 100,
    status: true,
    ...overrides
  }),

  // Helper to create test task data
  createTestTask: (overrides = {}) => ({
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'medium',
    ...overrides
  }),

  // Helper to create test equipment data
  createTestEquipment: (overrides = {}) => ({
    name: 'Test Equipment',
    description: 'Test Equipment Description',
    status: 'available',
    ...overrides
  }),

  // Helper to create test garden data
  createTestGarden: (overrides = {}) => ({
    name: 'Test Garden',
    area: 50,
    status: true,
    ...overrides
  }),

  // Helper to create test notification data
  createTestNotification: (overrides = {}) => ({
    title: 'Test Notification',
    message: 'Test Message',
    type: 'info',
    status: 'unread',
    ...overrides
  })
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
