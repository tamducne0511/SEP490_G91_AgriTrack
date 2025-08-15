# Server Testing Documentation

This directory contains comprehensive unit and integration tests for the AgriTrack server application.

## Test Structure

```
tests/
├── setup.js                          # Global test setup and utilities
├── unit/                             # Unit tests for individual components
│   ├── controllers/                  # Controller layer tests
│   │   └── auth.controller.test.js
│   ├── services/                     # Service layer tests
│   │   ├── auth.service.test.js
│   │   └── user.service.test.js
│   └── middlewares/                  # Middleware tests
│       ├── isLogin.middleware.test.js
│       └── errorHandler.test.js
└── integration/                      # Integration tests
    └── routes/                       # Route integration tests
        └── auth.route.test.js
```

## Test Categories

### 1. Unit Tests
Unit tests focus on testing individual functions and components in isolation. They use mocks to isolate the code under test from external dependencies.

**Coverage:**
- **Controllers**: Test request/response handling, validation, and service integration
- **Services**: Test business logic, data manipulation, and error handling
- **Middlewares**: Test authentication, authorization, and request processing
- **Models**: Test data validation and schema compliance

### 2. Integration Tests
Integration tests verify that different components work together correctly. They test the complete request-response cycle.

**Coverage:**
- **Routes**: Test complete HTTP request handling
- **Database Operations**: Test real database interactions
- **API Endpoints**: Test full API functionality

## Running Tests

### Prerequisites
Install dependencies:
```bash
npm install
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Test Output
- **Console**: Real-time test results and failures
- **Coverage**: HTML coverage report in `coverage/` directory
- **JUnit**: XML reports for CI/CD integration

## Test Configuration

### Jest Configuration
Located in `package.json`:
```json
{
  "jest": {
    "testEnvironment": "node",
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"],
    "collectCoverageFrom": [
      "controllers/**/*.js",
      "services/**/*.js",
      "middlewares/**/*.js",
      "utils/**/*.js"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": ["text", "lcov", "html"],
    "testMatch": [
      "**/tests/**/*.test.js",
      "**/tests/**/*.spec.js"
    ],
    "verbose": true
  }
}
```

### Test Setup
The `setup.js` file configures:
- MongoDB Memory Server for isolated database testing
- Global test utilities for common test data
- Console mocking to reduce test noise
- Database cleanup between tests

## Test Utilities

### Global Test Helpers
Available in all tests via `global.testUtils`:

```javascript
// Create test user data
const testUser = testUtils.createTestUser({
  email: 'custom@example.com',
  role: 'farmer'
});

// Create test farm data
const testFarm = testUtils.createTestFarm({
  name: 'Custom Farm',
  area: 200
});

// Create test task data
const testTask = testUtils.createTestTask({
  title: 'Custom Task',
  priority: 'high'
});

// Create test equipment data
const testEquipment = testUtils.createTestEquipment({
  name: 'Custom Equipment',
  status: 'maintenance'
});

// Create test garden data
const testGarden = testUtils.createTestGarden({
  name: 'Custom Garden',
  area: 100
});

// Create test notification data
const testNotification = testUtils.createTestNotification({
  title: 'Custom Notification',
  type: 'warning'
});
```

## Test Patterns

### 1. Arrange-Act-Assert (AAA)
All tests follow the AAA pattern:

```javascript
describe('Function Name', () => {
  it('should do something specific', async () => {
    // Arrange - Set up test data and mocks
    const input = 'test data';
    const expectedOutput = 'expected result';
    mockFunction.mockResolvedValue(expectedOutput);

    // Act - Execute the function under test
    const result = await functionUnderTest(input);

    // Assert - Verify the results
    expect(result).toBe(expectedOutput);
    expect(mockFunction).toHaveBeenCalledWith(input);
  });
});
```

### 2. Mocking Strategy
- **Services**: Mock external service calls
- **Models**: Mock database operations
- **Utilities**: Mock helper functions
- **Middleware**: Mock authentication and validation

### 3. Error Testing
Test both success and failure scenarios:

```javascript
it('should handle errors gracefully', async () => {
  // Arrange
  const error = new Error('Test error');
  mockFunction.mockRejectedValue(error);

  // Act & Assert
  await expect(functionUnderTest()).rejects.toThrow(error);
});
```

## Coverage Goals

### Minimum Coverage Requirements
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 85%
- **Lines**: 80%

### Critical Paths
- Authentication and authorization
- Data validation
- Error handling
- Database operations
- API endpoints

## Best Practices

### 1. Test Naming
Use descriptive test names that explain the scenario:

```javascript
// Good
it('should return 401 when invalid token is provided', () => {});

// Bad
it('should work', () => {});
```

### 2. Test Isolation
Each test should be independent and not rely on other tests:

```javascript
beforeEach(() => {
  jest.clearAllMocks();
  // Reset test data
});
```

### 3. Mock Verification
Always verify that mocks are called correctly:

```javascript
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
expect(mockFunction).toHaveBeenCalledTimes(1);
```

### 4. Error Scenarios
Test both happy path and error scenarios:

```javascript
describe('when successful', () => {
  it('should return expected result', () => {});
});

describe('when error occurs', () => {
  it('should handle error gracefully', () => {});
});
```

## Continuous Integration

### GitHub Actions
Tests run automatically on:
- Pull requests
- Push to main branch
- Manual triggers

### Pre-commit Hooks
Consider adding pre-commit hooks to run tests before commits:

```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

## Troubleshooting

### Common Issues

1. **MongoDB Memory Server Issues**
   ```bash
   # Clear Jest cache
   npm run test -- --clearCache
   ```

2. **Mock Not Working**
   ```javascript
   // Ensure mock is imported before the module under test
   jest.mock('./dependency');
   const moduleUnderTest = require('./moduleUnderTest');
   ```

3. **Async Test Failures**
   ```javascript
   // Use async/await or return promises
   it('should handle async operation', async () => {
     const result = await asyncFunction();
     expect(result).toBe(expected);
   });
   ```

### Debug Mode
Run tests in debug mode for detailed output:

```bash
npm run test -- --verbose --detectOpenHandles
```

## Adding New Tests

### 1. Unit Test Template
```javascript
const functionUnderTest = require('../../../path/to/function');

describe('Function Name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when successful', () => {
    it('should return expected result', async () => {
      // Arrange
      // Act
      // Assert
    });
  });

  describe('when error occurs', () => {
    it('should handle error gracefully', async () => {
      // Arrange
      // Act & Assert
    });
  });
});
```

### 2. Integration Test Template
```javascript
const request = require('supertest');
const app = require('../../../app');

describe('API Endpoint', () => {
  it('should return expected response', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send(testData)
      .expect(200);

    expect(response.body).toEqual(expectedResponse);
  });
});
```

## Performance Testing

### Load Testing
Consider adding load tests for critical endpoints:

```javascript
// Example with Artillery
const { check } = require('k6');

export default function() {
  const response = http.get('http://localhost:3000/api/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

This testing setup provides comprehensive coverage of the AgriTrack server application, ensuring reliability and maintainability of the codebase.
