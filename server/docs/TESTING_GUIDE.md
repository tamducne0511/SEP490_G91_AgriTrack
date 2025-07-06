# AgriTrack Testing Guide - Quick Start

## Quick Start Guide

This guide provides step-by-step instructions for writing and running tests in the AgriTrack backend project.

## 1. Running Your First Test

### Prerequisites
```bash
# Ensure you're in the server directory
cd server

# Install dependencies (if not already done)
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Categories
```bash
# Run only service tests
npm test -- --testPathPattern="services"

# Run only controller tests
npm test -- --testPathPattern="controllers"

# Run only middleware tests
npm test -- --testPathPattern="middlewares"

# Run only integration tests
npm test -- --testPathPattern="integration"
```

## 2. Writing Your First Test

### Step 1: Choose What to Test
Start with a simple service method or controller endpoint.

### Step 2: Create Test File
Create a new test file in the appropriate directory:

```bash
# For service tests
touch tests/services/your-service.test.js

# For controller tests
touch tests/controllers/your-controller.test.js

# For middleware tests
touch tests/middlewares/your-middleware.test.js
```

### Step 3: Write Basic Test Structure

```javascript
const yourService = require('../../services/your-service');

describe('Your Service', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should do something when condition is met', async () => {
      // Arrange
      const input = 'test data';
      
      // Act
      const result = await yourService.methodName(input);
      
      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveProperty('expectedProperty');
    });
  });
});
```

## 3. Common Testing Patterns

### Testing Service Methods

```javascript
const userService = require('../../services/user.service');
const User = require('../../models/user.model');

// Mock the model
jest.mock('../../models/user.model');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = { _id: userId, email: 'test@example.com' };
      User.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.findById(userId);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      User.findById.mockResolvedValue(null);

      // Act
      const result = await userService.findById(userId);

      // Assert
      expect(result).toBeNull();
    });
  });
});
```

### Testing Controller Endpoints

```javascript
const request = require('supertest');
const app = require('../../app');
const { createTestUser, generateToken, getAuthHeaders } = require('../utils/testUtils');

describe('User Controller', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    testUser = await createTestUser();
    authToken = generateToken(testUser);
  });

  describe('GET /users/profile', () => {
    it('should get user profile when authenticated', async () => {
      // Act
      const response = await request(app)
        .get('/users/profile')
        .set(getAuthHeaders(authToken));

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data.email).toBe(testUser.email);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app)
        .get('/users/profile');

      // Assert
      expect(response.status).toBe(401);
    });
  });
});
```

### Testing Middleware

```javascript
const isLoginMiddleware = require('../../middlewares/isLogin.middleware');

describe('isLogin Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      get: jest.fn()
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('with valid token', () => {
    it('should call next() when token is valid', () => {
      // Arrange
      const validToken = 'valid.jwt.token';
      mockReq.get.mockReturnValue(`Bearer ${validToken}`);

      // Act
      isLoginMiddleware(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('with invalid token', () => {
    it('should return 401 when no token provided', () => {
      // Arrange
      mockReq.get.mockReturnValue(undefined);

      // Act
      isLoginMiddleware(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Access denied. No token provided.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
```

## 4. Using Test Utilities

### Creating Test Data

```javascript
const { createTestUser, createTestFarm } = require('../utils/testUtils');

describe('Farm Operations', () => {
  let testUser;
  let testFarm;

  beforeEach(async () => {
    // Create test user with default values
    testUser = await createTestUser();
    
    // Create test farm with custom values
    testFarm = await createTestFarm({
      name: 'Custom Farm',
      area: 200
    });
  });
});
```

### Authentication Testing

```javascript
const { generateToken, getAuthHeaders } = require('../utils/testUtils');

describe('Protected Endpoints', () => {
  let authToken;
  let headers;

  beforeEach(async () => {
    const testUser = await createTestUser();
    authToken = generateToken(testUser);
    headers = getAuthHeaders(authToken);
  });

  it('should access protected endpoint', async () => {
    const response = await request(app)
      .get('/protected-endpoint')
      .set(headers);

    expect(response.status).toBe(200);
  });
});
```

## 5. Testing Error Scenarios

### Service Error Testing

```javascript
describe('User Service - Error Cases', () => {
  it('should throw error when email is invalid', async () => {
    // Arrange
    const invalidUserData = {
      email: 'invalid-email',
      password: 'password123'
    };

    // Act & Assert
    await expect(userService.create(invalidUserData))
      .rejects.toThrow('Invalid email format');
  });

  it('should throw error when user already exists', async () => {
    // Arrange
    const existingUser = { email: 'existing@example.com' };
    User.find.mockResolvedValue([existingUser]);

    // Act & Assert
    await expect(userService.create(existingUser))
      .rejects.toThrow('User already exists');
  });
});
```

### API Error Testing

```javascript
describe('API Error Handling', () => {
  it('should return 400 for invalid input', async () => {
    const response = await request(app)
      .post('/users')
      .send({ invalid: 'data' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  it('should return 500 for server errors', async () => {
    // Mock service to throw error
    userService.create.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/users')
      .send(validUserData);

    expect(response.status).toBe(500);
  });
});
```

## 6. Running Tests with Coverage

### Generate Coverage Report
```bash
npm run test:coverage
```

### View Coverage in Browser
```bash
# On Windows
start coverage/lcov-report/index.html

# On macOS
open coverage/lcov-report/index.html

# On Linux
xdg-open coverage/lcov-report/index.html
```

### Coverage Thresholds
The project is configured with 80% coverage thresholds:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## 7. Debugging Tests

### Running Tests in Debug Mode
```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand --testNamePattern="test name"

# Run with verbose output
npm test -- --verbose --testNamePattern="login"
```

### Adding Console Logs
```javascript
it('should debug test execution', async () => {
  console.log('Test data:', testData);
  const result = await methodUnderTest(testData);
  console.log('Result:', result);
  expect(result).toBeDefined();
});
```

## 8. Best Practices Checklist

### Before Writing Tests
- [ ] Understand the code you're testing
- [ ] Identify the main functionality and edge cases
- [ ] Plan your test structure

### While Writing Tests
- [ ] Use descriptive test names
- [ ] Follow AAA pattern (Arrange, Act, Assert)
- [ ] Test both success and failure scenarios
- [ ] Keep tests independent and isolated
- [ ] Use meaningful test data

### After Writing Tests
- [ ] Run tests to ensure they pass
- [ ] Check coverage to identify gaps
- [ ] Review test readability and maintainability
- [ ] Update documentation if needed

## 9. Common Commands Reference

```bash
# Basic test commands
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
npm run test:ci           # Run tests for CI

# Selective testing
npm test -- --testPathPattern="services"     # Run service tests only
npm test -- --testNamePattern="login"        # Run tests matching pattern
npm test -- --verbose                        # Verbose output
npm test -- --runInBand                      # Run tests sequentially

# Debugging
npm test -- --detectOpenHandles              # Detect open handles
npm test -- --forceExit                      # Force exit after tests
```

## 10. Next Steps

1. **Start with Simple Tests**: Begin with basic service methods
2. **Add Controller Tests**: Test API endpoints
3. **Include Error Cases**: Test failure scenarios
4. **Improve Coverage**: Aim for 80%+ coverage
5. **Add Integration Tests**: Test complete workflows
6. **Set Up CI/CD**: Automate test running

## Need Help?

- Check the main testing documentation: `docs/TESTING_DOCUMENTATION.md`
- Review existing test examples in the `tests/` directory
- Consult Jest documentation: https://jestjs.io/docs/getting-started
- Ask the team for guidance on complex testing scenarios 