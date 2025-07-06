# AgriTrack Backend Unit Testing Documentation

## Table of Contents
1. [Overview](#overview)
2. [Testing Architecture](#testing-architecture)
3. [Setup and Installation](#setup-and-installation)
4. [Test Structure](#test-structure)
5. [Writing Tests](#writing-tests)
6. [Running Tests](#running-tests)
7. [Test Categories](#test-categories)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Continuous Integration](#continuous-integration)
11. [API Reference](#api-reference)

## Overview

This document provides comprehensive guidance for the unit testing framework implemented for the AgriTrack backend API. The testing framework is built with Jest, Supertest, and MongoDB Memory Server to ensure reliable, isolated, and comprehensive testing of all application components.

### Key Features
- **Isolated Testing**: Each test runs in isolation with a fresh database
- **Comprehensive Coverage**: Tests cover controllers, services, middlewares, and integration flows
- **Realistic Testing**: Uses MongoDB Memory Server for realistic database operations
- **Easy Maintenance**: Centralized test utilities and configuration
- **Fast Execution**: Optimized test setup for quick feedback

## Testing Architecture

### Technology Stack
- **Jest**: Primary testing framework
- **Supertest**: HTTP assertion library for API testing
- **MongoDB Memory Server**: In-memory MongoDB for isolated testing
- **Custom Test Utils**: Helper functions for common testing operations

### Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Test Runner   │───▶│  Test Setup     │───▶│  MongoDB Memory │
│     (Jest)      │    │   (setup.js)    │    │     Server      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Test Utils     │    │  Test Config    │    │  Test Data      │
│ (testUtils.js)  │    │ (testConfig.js) │    │   Factories     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Unit Tests     │    │ Integration     │    │  API Tests      │
│   (Services)    │    │    Tests        │    │ (Controllers)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Git

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Verify Installation**
   ```bash
   npm test -- --testPathPattern="middlewares"
   ```

3. **Check Test Configuration**
   ```bash
   npm run test:coverage
   ```

### Environment Setup

The testing framework automatically configures the environment:
- Uses MongoDB Memory Server (no external database required)
- Sets up test-specific JWT secrets
- Configures test data paths
- Handles file upload testing

## Test Structure

### Directory Organization
```
tests/
├── setup.js                     # Global test setup and teardown
├── config/
│   └── testConfig.js            # Test configuration and constants
├── utils/
│   └── testUtils.js             # Common test utilities and helpers
├── controllers/                 # Controller unit tests
│   ├── auth.controller.test.js
│   ├── farm.controller.test.js
│   └── task.controller.test.js
├── services/                    # Service layer unit tests
│   ├── user.service.test.js
│   └── farm.service.test.js
├── middlewares/                 # Middleware unit tests
│   └── isLogin.middleware.test.js
└── integration/                 # Integration tests
    └── auth.integration.test.js
```

### File Naming Convention
- **Test Files**: `*.test.js` or `*.spec.js`
- **Test Utilities**: `testUtils.js`
- **Configuration**: `testConfig.js`
- **Setup**: `setup.js`

## Writing Tests

### Test Structure Pattern

```javascript
describe('Feature Name', () => {
  let testData;
  
  beforeEach(() => {
    // Setup test data
    testData = createTestData();
  });
  
  afterEach(() => {
    // Cleanup
    jest.clearAllMocks();
  });
  
  describe('Method Name', () => {
    it('should do something when condition is met', async () => {
      // Arrange
      const input = 'test input';
      
      // Act
      const result = await methodUnderTest(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
    
    it('should handle error when invalid input', async () => {
      // Arrange
      const invalidInput = null;
      
      // Act & Assert
      await expect(methodUnderTest(invalidInput))
        .rejects.toThrow('Expected error message');
    });
  });
});
```

### Service Test Example

```javascript
const userService = require('../../services/user.service');
const User = require('../../models/user.model');

// Mock the models
jest.mock('../../models/user.model');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123'
      };

      User.find.mockResolvedValue([]);
      const mockUser = { ...userData, _id: '1', save: jest.fn().mockResolvedValue(true) };
      User.mockImplementation(() => mockUser);

      // Act
      const result = await userService.create(userData);

      // Assert
      expect(User.find).toHaveBeenCalledWith({ email: userData.email });
      expect(User).toHaveBeenCalledWith(userData);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });
});
```

### Controller Test Example

```javascript
const request = require('supertest');
const app = require('../../app');
const { createTestUser, generateToken, getAuthHeaders } = require('../utils/testUtils');

describe('Auth Controller', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    testUser = await createTestUser();
    authToken = generateToken(testUser);
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Act
      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
    });
  });
});
```

### Integration Test Example

```javascript
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user.model');
const Farm = require('../../models/farm.model');

describe('Auth Integration Tests', () => {
  let testUser;
  let testFarm;

  beforeEach(async () => {
    // Create test farm
    testFarm = new Farm({
      name: 'Test Farm',
      description: 'Test farm for integration tests',
      address: 'Test Address',
      area: 100
    });
    await testFarm.save();

    // Create test user
    testUser = await createTestUser({
      email: 'integration@test.com',
      farmId: testFarm._id
    });
  });

  describe('Complete Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      // Step 1: Login
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      
      // Step 2: Get profile
      const token = loginResponse.body.data.token;
      const profileResponse = await request(app)
        .get('/auth/me')
        .set(getAuthHeaders(token));

      expect(profileResponse.status).toBe(200);
    });
  });
});
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI environment
npm run test:ci
```

### Selective Testing

```bash
# Run specific test file
npm test -- tests/services/user.service.test.js

# Run tests matching pattern
npm test -- --testNamePattern="login"

# Run tests in specific directory
npm test -- --testPathPattern="services"

# Run tests with verbose output
npm test -- --verbose
```

### Coverage Commands

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html

# Generate coverage for specific files
npm test -- --coverage --collectCoverageFrom="services/**/*.js"
```

## Test Categories

### 1. Unit Tests

Unit tests focus on testing individual functions and methods in isolation.

#### Service Tests
- **Purpose**: Test business logic and data operations
- **Scope**: Individual service methods
- **Mocking**: Database operations and external dependencies
- **Coverage**: All CRUD operations, validation, error handling

**Example Coverage:**
- User creation, update, deletion
- Farm management operations
- Task assignment and status updates
- Data validation and business rules

#### Middleware Tests
- **Purpose**: Test request processing middleware
- **Scope**: Authentication, validation, error handling
- **Mocking**: Request/response objects
- **Coverage**: Token validation, role checking, error responses

### 2. Integration Tests

Integration tests verify that different parts of the system work together correctly.

#### API Integration Tests
- **Purpose**: Test complete API workflows
- **Scope**: End-to-end user journeys
- **Database**: Real MongoDB operations with test data
- **Coverage**: Authentication flows, data persistence, error scenarios

#### Database Integration Tests
- **Purpose**: Test database operations with real data
- **Scope**: Model operations, relationships, transactions
- **Isolation**: Each test uses fresh database state
- **Coverage**: Data integrity, foreign key relationships

### 3. Controller Tests

Controller tests focus on HTTP request/response handling.

#### Endpoint Testing
- **Purpose**: Test API endpoint behavior
- **Scope**: Request validation, response formatting, status codes
- **Mocking**: Service layer dependencies
- **Coverage**: Success cases, error cases, authentication

## Best Practices

### 1. Test Organization

#### Naming Conventions
```javascript
// Test suite naming
describe('UserService', () => {
  describe('create', () => {
    it('should create user when valid data provided', () => {});
    it('should throw error when email already exists', () => {});
  });
});

// Test case naming
it('should return 200 when user logs in with valid credentials', () => {});
it('should return 400 when user provides invalid email format', () => {});
it('should return 401 when user provides wrong password', () => {});
```

#### File Organization
- One test file per module/component
- Group related tests in describe blocks
- Use beforeEach/afterEach for setup/cleanup
- Keep tests focused and atomic

### 2. Test Data Management

#### Using Test Utilities
```javascript
const { createTestUser, generateToken, getAuthHeaders } = require('../utils/testUtils');

// Create test user with default values
const user = await createTestUser();

// Create test user with custom values
const adminUser = await createTestUser({
  email: 'admin@test.com',
  role: 'admin'
});

// Generate authentication token
const token = generateToken(user);

// Get auth headers for requests
const headers = getAuthHeaders(token);
```

#### Test Data Isolation
```javascript
beforeEach(async () => {
  // Create fresh test data for each test
  testUser = await createTestUser();
  testFarm = await createTestFarm();
});

afterEach(async () => {
  // Clean up test data
  await User.deleteMany({});
  await Farm.deleteMany({});
});
```

### 3. Mocking Strategies

#### Service Layer Mocking
```javascript
// Mock external dependencies
jest.mock('../../models/user.model');
jest.mock('../../services/email.service');

// Mock specific methods
User.findById.mockResolvedValue(mockUser);
emailService.sendWelcomeEmail.mockResolvedValue(true);
```

#### API Testing Mocking
```javascript
// Mock service layer for controller tests
jest.mock('../../services/user.service');

userService.create.mockResolvedValue(mockCreatedUser);
userService.find.mockResolvedValue(mockUser);
```

### 4. Assertion Best Practices

#### Clear Assertions
```javascript
// Good: Clear and specific assertions
expect(response.status).toBe(200);
expect(response.body.message).toBe('User created successfully');
expect(response.body.data).toHaveProperty('id');
expect(response.body.data.email).toBe('test@example.com');

// Good: Error case assertions
await expect(userService.create(invalidData))
  .rejects.toThrow('Email is required');
```

#### Async Testing
```javascript
// Good: Proper async/await handling
it('should create user asynchronously', async () => {
  const result = await userService.create(userData);
  expect(result).toBeDefined();
});

// Good: Error testing with async
it('should handle async errors', async () => {
  await expect(asyncFunction())
    .rejects.toThrow('Expected error');
});
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues
```bash
# Error: MongoDB connection failed
# Solution: Check if MongoDB Memory Server is running
npm test -- --testPathPattern="setup"
```

#### 2. ObjectId Validation Errors
```javascript
// Error: Cast to ObjectId failed
// Solution: Use proper ObjectId creation
const { createObjectId } = require('../utils/testUtils');
const farmId = createObjectId();
```

#### 3. Authentication Token Issues
```javascript
// Error: Unauthorized (401)
// Solution: Ensure proper token generation
const token = generateToken(user);
const headers = getAuthHeaders(token);
```

#### 4. Test Isolation Issues
```javascript
// Error: Tests affecting each other
// Solution: Proper cleanup in afterEach
afterEach(async () => {
  await User.deleteMany({});
  jest.clearAllMocks();
});
```

#### 5. Mock Not Working
```javascript
// Error: Mock not being called
// Solution: Ensure proper mock setup
beforeEach(() => {
  jest.clearAllMocks();
  User.findById.mockResolvedValue(mockUser);
});
```

### Debugging Tests

#### Running Tests in Debug Mode
```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand --testNamePattern="test name"

# Debug with console output
npm test -- --verbose --testNamePattern="login"
```

#### Adding Debug Logs
```javascript
it('should debug test execution', async () => {
  console.log('Test data:', testData);
  const result = await methodUnderTest(testData);
  console.log('Result:', result);
  expect(result).toBeDefined();
});
```

## Continuous Integration

### GitHub Actions Configuration

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run test:ci
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

### Coverage Thresholds

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test -- --coverage --watchAll=false"
    }
  }
}
```

## API Reference

### Test Utilities

#### `createTestUser(userData = {})`
Creates a test user with default or custom values.

```javascript
const user = await createTestUser({
  email: 'custom@test.com',
  role: 'farmer',
  farmId: 'farm123'
});
```

#### `generateToken(user)`
Generates JWT token for authentication testing.

```javascript
const token = generateToken(user);
```

#### `getAuthHeaders(token)`
Creates authentication headers for API requests.

```javascript
const headers = getAuthHeaders(token);
```

#### `createObjectId()`
Creates a valid MongoDB ObjectId string.

```javascript
const id = createObjectId();
```

#### `mockFileUpload(filename)`
Creates mock file upload data for testing.

```javascript
const fileData = mockFileUpload('test-image.jpg');
```

### Test Configuration

#### `TEST_CONFIG`
Centralized test configuration constants.

```javascript
const { TEST_CONFIG } = require('../config/testConfig');

// Use predefined test data
const userData = TEST_CONFIG.TEST_USER;
```

#### `TEST_UTILS`
Utility functions for test data generation.

```javascript
const { TEST_UTILS } = require('../config/testConfig');

// Generate test data with overrides
const customUser = TEST_UTILS.generateTestData('USER', {
  email: 'custom@test.com'
});
```

### Jest Configuration

```json
{
  "jest": {
    "testEnvironment": "node",
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"],
    "testMatch": [
      "**/tests/**/*.test.js",
      "**/tests/**/*.spec.js"
    ],
    "collectCoverageFrom": [
      "controllers/**/*.js",
      "services/**/*.js",
      "models/**/*.js",
      "middlewares/**/*.js"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": ["text", "lcov", "html"]
  }
}
```

---

## Conclusion

This testing framework provides a robust foundation for ensuring code quality and reliability in the AgriTrack backend. By following the patterns and best practices outlined in this documentation, developers can write maintainable, comprehensive tests that catch bugs early and provide confidence in code changes.

For additional support or questions about the testing framework, refer to the test examples in the `tests/` directory or consult the Jest documentation at https://jestjs.io/docs/getting-started. 