# AgriTrack Testing Checklist

## Pre-Testing Checklist

### Before Writing Tests
- [ ] **Understand the Code**: Read and understand the code you're testing
- [ ] **Identify Test Cases**: List all possible scenarios (happy path, edge cases, error cases)
- [ ] **Plan Test Structure**: Decide on test organization and naming
- [ ] **Check Existing Tests**: Review similar tests for patterns and conventions
- [ ] **Set Up Test File**: Create test file in the correct directory with proper naming

### Test File Setup
- [ ] **Correct Location**: Place test file in appropriate directory (`tests/services/`, `tests/controllers/`, etc.)
- [ ] **Proper Naming**: Use `.test.js` or `.spec.js` extension
- [ ] **Import Dependencies**: Import all necessary modules and test utilities
- [ ] **Mock Setup**: Set up required mocks at the top of the file
- [ ] **Test Structure**: Use proper `describe` and `it` blocks

## Test Writing Checklist

### Test Structure
- [ ] **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
- [ ] **AAA Pattern**: Follow Arrange-Act-Assert pattern
- [ ] **Single Responsibility**: Each test should test one specific behavior
- [ ] **Proper Nesting**: Use `describe` blocks to group related tests
- [ ] **Setup/Teardown**: Use `beforeEach` and `afterEach` appropriately

### Test Data
- [ ] **Use Test Utilities**: Use `createTestUser()`, `createTestFarm()` from test utilities
- [ ] **Realistic Data**: Use realistic test data that matches production scenarios
- [ ] **Data Isolation**: Ensure test data doesn't interfere with other tests
- [ ] **Cleanup**: Clean up test data in `afterEach` or `afterAll`
- [ ] **Random Data**: Use unique identifiers to avoid conflicts

### Assertions
- [ ] **Specific Assertions**: Use specific assertions that test exact behavior
- [ ] **Multiple Assertions**: Test all relevant aspects of the result
- [ ] **Error Assertions**: Use `expect().rejects.toThrow()` for async error testing
- [ ] **Type Checking**: Verify data types and structure where relevant
- [ ] **Edge Cases**: Test boundary conditions and edge cases

## Service Test Checklist

### Mocking
- [ ] **Mock Models**: Mock database models at the top of the file
- [ ] **Mock External Services**: Mock any external API calls or services
- [ ] **Clear Mocks**: Use `jest.clearAllMocks()` in `beforeEach`
- [ ] **Realistic Mock Data**: Return realistic mock data from mocks
- [ ] **Mock Verification**: Verify that mocks were called with correct parameters

### Test Cases
- [ ] **Success Cases**: Test successful operations with valid data
- [ ] **Error Cases**: Test error scenarios (invalid input, database errors, etc.)
- [ ] **Validation**: Test input validation and business rules
- [ ] **Edge Cases**: Test boundary conditions and unusual inputs
- [ ] **Async Operations**: Properly handle async/await in tests

### Example Service Test Structure
```javascript
const userService = require('../../services/user.service');
const User = require('../../models/user.model');

jest.mock('../../models/user.model');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create user successfully with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', password: 'password123' };
      User.find.mockResolvedValue([]);
      const mockUser = { ...userData, _id: '1', save: jest.fn().mockResolvedValue(true) };
      User.mockImplementation(() => mockUser);

      // Act
      const result = await userService.create(userData);

      // Assert
      expect(User.find).toHaveBeenCalledWith({ email: userData.email });
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user already exists', async () => {
      // Arrange
      const userData = { email: 'existing@example.com' };
      User.find.mockResolvedValue([{ email: 'existing@example.com' }]);

      // Act & Assert
      await expect(userService.create(userData))
        .rejects.toThrow('User already exists');
    });
  });
});
```

## Controller Test Checklist

### Request/Response Setup
- [ ] **Use Supertest**: Use `supertest` for HTTP request testing
- [ ] **Authentication**: Set up authentication tokens and headers
- [ ] **Request Data**: Prepare realistic request data
- [ ] **Response Validation**: Test response status, body, and headers
- [ ] **Error Responses**: Test error status codes and error messages

### Test Cases
- [ ] **Success Responses**: Test successful API calls
- [ ] **Authentication**: Test protected endpoints with and without auth
- [ ] **Validation Errors**: Test invalid input handling
- [ ] **Authorization**: Test role-based access control
- [ ] **Server Errors**: Test internal server error handling

### Example Controller Test Structure
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
    });

    it('should return 401 with invalid credentials', async () => {
      // Arrange
      const invalidData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Act
      const response = await request(app)
        .post('/auth/login')
        .send(invalidData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});
```

## Middleware Test Checklist

### Mock Setup
- [ ] **Mock Request**: Create realistic request object with headers, body, etc.
- [ ] **Mock Response**: Create response object with status and json methods
- [ ] **Mock Next**: Create mock next function
- [ ] **Token Setup**: Set up valid/invalid tokens for authentication testing
- [ ] **Error Scenarios**: Prepare various error conditions

### Test Cases
- [ ] **Success Path**: Test successful middleware execution
- [ ] **Error Handling**: Test error scenarios and proper error responses
- [ ] **Authentication**: Test token validation and user extraction
- [ ] **Authorization**: Test role-based access control
- [ ] **Edge Cases**: Test malformed tokens, missing headers, etc.

### Example Middleware Test Structure
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
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
```

## Integration Test Checklist

### Test Setup
- [ ] **Database Setup**: Use MongoDB Memory Server for isolated testing
- [ ] **Test Data**: Create comprehensive test data sets
- [ ] **User Flows**: Test complete user workflows from start to finish
- [ ] **Data Persistence**: Verify data is properly saved and retrieved
- [ ] **Cleanup**: Clean up all test data after tests

### Test Cases
- [ ] **Complete Workflows**: Test end-to-end user journeys
- [ ] **Data Integrity**: Verify data consistency across operations
- [ ] **Error Recovery**: Test error handling in complete workflows
- [ ] **Performance**: Ensure tests complete in reasonable time
- [ ] **Isolation**: Ensure tests don't interfere with each other

### Example Integration Test Structure
```javascript
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user.model');
const Farm = require('../../models/farm.model');

describe('Farm Management Integration', () => {
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

  describe('Complete Farm Management Flow', () => {
    it('should complete full farm management workflow', async () => {
      // Step 1: Login
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      
      // Step 2: Get farm details
      const token = loginResponse.body.data.token;
      const farmResponse = await request(app)
        .get(`/admin/farms/${testFarm._id}`)
        .set(getAuthHeaders(token));

      expect(farmResponse.status).toBe(200);
      expect(farmResponse.body.data.name).toBe('Test Farm');
    });
  });
});
```

## Post-Testing Checklist

### Test Execution
- [ ] **Run Tests**: Execute the test file to ensure it works
- [ ] **Check Coverage**: Verify test coverage meets requirements
- [ ] **Fix Failures**: Address any test failures or errors
- [ ] **Performance**: Ensure tests run quickly and efficiently
- [ ] **Isolation**: Verify tests don't affect other tests

### Code Review
- [ ] **Readability**: Ensure tests are easy to read and understand
- [ ] **Maintainability**: Verify tests are easy to maintain and update
- [ ] **Documentation**: Add comments for complex test scenarios
- [ ] **Best Practices**: Follow established testing patterns
- [ ] **Naming**: Use clear, descriptive names for tests and variables

### Quality Assurance
- [ ] **Edge Cases**: Ensure all edge cases are covered
- [ ] **Error Scenarios**: Test all possible error conditions
- [ ] **Data Validation**: Verify input validation is properly tested
- [ ] **Business Logic**: Ensure business rules are correctly tested
- [ ] **Integration**: Test interactions between components

## Common Mistakes to Avoid

### ❌ Don't Do This
- [ ] **Hard-coded Data**: Don't use hard-coded test data that might conflict
- [ ] **Incomplete Mocks**: Don't forget to mock all external dependencies
- [ ] **Vague Assertions**: Don't use generic assertions like `expect(result).toBeDefined()`
- [ ] **Missing Cleanup**: Don't forget to clean up test data
- [ ] **Flaky Tests**: Don't write tests that depend on timing or external state
- [ ] **Over-mocking**: Don't mock everything - test real behavior when possible
- [ ] **Poor Naming**: Don't use vague test names like "should work" or "test 1"

### ✅ Do This Instead
- [ ] **Use Test Utilities**: Use `createTestUser()`, `generateToken()` from test utilities
- [ ] **Complete Mocks**: Mock all external dependencies properly
- [ ] **Specific Assertions**: Use specific assertions that test exact behavior
- [ ] **Proper Cleanup**: Always clean up in `afterEach` or `afterAll`
- [ ] **Stable Tests**: Write deterministic tests that don't depend on external factors
- [ ] **Realistic Testing**: Test real behavior when it makes sense
- [ ] **Descriptive Names**: Use clear, descriptive test names that explain the scenario

## Performance Checklist

### Test Execution
- [ ] **Fast Execution**: Individual tests should complete in <100ms
- [ ] **Parallel Execution**: Tests should be able to run in parallel
- [ ] **Memory Usage**: Tests should not consume excessive memory
- [ ] **Database Operations**: Minimize database operations in tests
- [ ] **Mock Usage**: Use mocks to avoid slow external calls

### Coverage Optimization
- [ ] **Meaningful Coverage**: Focus on high-impact areas
- [ ] **Avoid Over-testing**: Don't test trivial code just for coverage
- [ ] **Integration vs Unit**: Use unit tests for logic, integration tests for workflows
- [ ] **Test Selection**: Run only relevant tests during development
- [ ] **Coverage Targets**: Aim for 80%+ coverage on critical paths

## Maintenance Checklist

### Regular Maintenance
- [ ] **Update Tests**: Keep tests updated when code changes
- [ ] **Review Coverage**: Regularly review and improve test coverage
- [ ] **Remove Dead Tests**: Remove tests for deleted functionality
- [ ] **Refactor Tests**: Improve test structure and readability
- [ ] **Update Dependencies**: Keep testing dependencies up to date

### Continuous Improvement
- [ ] **Learn from Failures**: Analyze test failures to improve testing
- [ ] **Share Best Practices**: Share testing patterns with the team
- [ ] **Automate Testing**: Set up automated test execution
- [ ] **Monitor Performance**: Track test execution time and optimize
- [ ] **Document Changes**: Update testing documentation as needed

---

## Quick Reference Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/services/user.service.test.js

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests matching pattern
npm test -- --testNamePattern="login"

# Debug tests
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Need Help?

- Check the main testing documentation: `docs/TESTING_DOCUMENTATION.md`
- Review the quick start guide: `docs/TESTING_GUIDE.md`
- Look at existing test examples in the `tests/` directory
- Ask the team for guidance on complex testing scenarios 