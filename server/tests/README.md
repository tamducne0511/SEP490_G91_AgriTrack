# AgriTrack Backend Testing Guide

This directory contains comprehensive unit and integration tests for the AgriTrack backend API.

## 🏗️ Testing Architecture

The testing framework is built with:
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library for API testing
- **MongoDB Memory Server** - In-memory MongoDB for isolated testing
- **Custom Test Utils** - Helper functions for common testing operations

## 📁 Directory Structure

```
tests/
├── setup.js                 # Global test setup and teardown
├── config/
│   └── testConfig.js        # Test configuration and constants
├── utils/
│   └── testUtils.js         # Common test utilities and helpers
├── controllers/             # Controller unit tests
│   ├── auth.controller.test.js
│   ├── farm.controller.test.js
│   └── task.controller.test.js
├── services/                # Service layer unit tests
│   ├── user.service.test.js
│   └── farm.service.test.js
├── middlewares/             # Middleware unit tests
│   └── isLogin.middleware.test.js
└── integration/             # Integration tests
    └── auth.integration.test.js
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following dependencies installed:

```bash
npm install --save-dev jest supertest mongodb-memory-server @types/jest
```

### Running Tests

#### Run all tests
```bash
npm test
```

#### Run tests in watch mode
```bash
npm run test:watch
```

#### Run tests with coverage
```bash
npm run test:coverage
```

#### Run tests in CI mode
```bash
npm run test:ci
```

#### Run specific test files
```bash
# Run only auth tests
npm test -- auth

# Run only controller tests
npm test -- controllers

# Run only integration tests
npm test -- integration
```

## 📝 Test Categories

### 1. Unit Tests

Unit tests focus on testing individual functions and methods in isolation.

#### Controller Tests
- Test HTTP endpoints
- Validate request/response handling
- Test authentication and authorization
- Verify error handling

#### Service Tests
- Test business logic
- Mock database operations
- Test data validation
- Verify error scenarios

#### Middleware Tests
- Test authentication middleware
- Test validation middleware
- Test error handling middleware

### 2. Integration Tests

Integration tests verify that different parts of the system work together correctly.

- Complete user workflows
- Database operations with real data
- API endpoint interactions
- Authentication flows

## 🛠️ Test Utilities

### Test Utils (`utils/testUtils.js`)

Common helper functions for testing:

```javascript
const { 
  createTestUser, 
  generateToken, 
  getAuthHeaders, 
  mockFileUpload,
  createTestFarm,
  createTestGarden,
  createTestTask 
} = require('../utils/testUtils');

// Create a test user
const user = await createTestUser({
  email: 'test@example.com',
  role: 'farmer'
});

// Generate JWT token
const token = generateToken(user);

// Get auth headers
const headers = getAuthHeaders(token);
```

### Test Configuration (`config/testConfig.js`)

Centralized test configuration:

```javascript
const { TEST_CONFIG, TEST_UTILS } = require('../config/testConfig');

// Use predefined test data
const userData = TEST_UTILS.generateTestData('USER', {
  email: 'custom@test.com'
});
```

## 📊 Test Coverage

The test suite aims to achieve high coverage across:

- **Controllers**: HTTP request/response handling
- **Services**: Business logic and data operations
- **Middlewares**: Authentication and validation
- **Models**: Data validation and schema
- **Utils**: Helper functions

### Coverage Reports

After running tests with coverage, you can find reports in:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI tools

## 🔧 Writing Tests

### Test Structure

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

### Best Practices

1. **Test Naming**: Use descriptive test names that explain the scenario
2. **Arrange-Act-Assert**: Structure tests in three clear sections
3. **Isolation**: Each test should be independent and not rely on other tests
4. **Mocking**: Mock external dependencies (database, external APIs)
5. **Edge Cases**: Test both success and failure scenarios
6. **Data Cleanup**: Always clean up test data after each test

### API Testing with Supertest

```javascript
const request = require('supertest');
const app = require('../../app');

describe('API Endpoint', () => {
  it('should return 200 for valid request', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .set('Authorization', `Bearer ${token}`)
      .send({ data: 'test' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });
});
```

### Database Testing

```javascript
// Use MongoDB Memory Server for isolated testing
beforeAll(async () => {
  // Database connection is handled in setup.js
});

afterEach(async () => {
  // Clean up data after each test
  await User.deleteMany({});
  await Farm.deleteMany({});
});
```

## 🐛 Debugging Tests

### Running Tests in Debug Mode

```bash
# Run specific test with debugging
node --inspect-brk node_modules/.bin/jest --runInBand --testNamePattern="test name"
```

### Common Issues

1. **Database Connection**: Ensure MongoDB Memory Server is running
2. **Async/Await**: Make sure to await async operations
3. **Mock Cleanup**: Clear mocks between tests
4. **Test Isolation**: Don't share state between tests

## 📈 Continuous Integration

### GitHub Actions Example

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
```

### Coverage Thresholds

Configure minimum coverage thresholds in `package.json`:

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

## 🔍 Test Commands Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ci` | Run tests for CI environment |
| `npm test -- --verbose` | Run tests with verbose output |
| `npm test -- --testNamePattern="pattern"` | Run tests matching pattern |

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🤝 Contributing

When adding new features or fixing bugs:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve test coverage
4. Update this documentation if needed
5. Follow the existing test patterns and conventions 