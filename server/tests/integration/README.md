# Integration Tests

This directory contains comprehensive integration tests for the AgriTrack server API. These tests verify the complete functionality of the application by testing the full request-response cycle, including database operations, authentication, authorization, and business logic.

## Test Structure

### Test Files

- **`auth.integration.test.js`** - Authentication and user management tests
- **`farm.integration.test.js`** - Farm management and CRUD operations
- **`task.integration.test.js`** - Task management, assignment, and status updates
- **`equipment.integration.test.js`** - Equipment and category management
- **`notification.integration.test.js`** - Notification system and user-specific notifications
- **`user.integration.test.js`** - User management and role-based access control

### Test Runner

- **`test-runner.js`** - Automated test runner with reporting and coverage

## Features Tested

### Authentication & Authorization
- ✅ User login with valid/invalid credentials
- ✅ JWT token generation and validation
- ✅ Password change functionality
- ✅ Profile updates
- ✅ Role-based access control (Admin, Farmer, Expert, Farm Admin)
- ✅ Token expiration and validation

### Farm Management
- ✅ CRUD operations for farms
- ✅ Farm status management
- ✅ Farm filtering and search
- ✅ Farm deletion with dependency checks
- ✅ Admin-only access control

### Task Management
- ✅ Task creation and assignment
- ✅ Task status updates (pending, in_progress, completed)
- ✅ Task filtering by status, priority, and assignee
- ✅ Equipment assignment to tasks
- ✅ Role-based task access

### Equipment Management
- ✅ Equipment CRUD operations
- ✅ Equipment status management (available, in_use, maintenance, retired)
- ✅ Equipment category management
- ✅ Equipment filtering and search
- ✅ Warranty and purchase date tracking

### Notification System
- ✅ Notification creation and delivery
- ✅ User-specific notifications
- ✅ Notification status updates (read/unread)
- ✅ Notification filtering by type and status
- ✅ Notification types (info, warning, error, success)

### User Management
- ✅ User CRUD operations
- ✅ Role assignment and validation
- ✅ User status management (active/inactive)
- ✅ Email uniqueness validation
- ✅ Farm assignment for farmers

## Test Coverage

### HTTP Status Codes
- ✅ 200 - Success responses
- ✅ 201 - Created responses
- ✅ 400 - Bad request validation
- ✅ 401 - Unauthorized access
- ✅ 403 - Forbidden access
- ✅ 404 - Resource not found
- ✅ 500 - Server errors

### Database Operations
- ✅ Create operations with validation
- ✅ Read operations with filtering
- ✅ Update operations with constraints
- ✅ Delete operations with dependencies
- ✅ Relationship integrity

### Business Logic
- ✅ Data validation and sanitization
- ✅ Business rule enforcement
- ✅ Error handling and recovery
- ✅ State management

## Running Tests

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Ensure MongoDB is running (tests use MongoDB Memory Server)

3. Set up environment variables:
```bash
cp .env.example .env
```

### Running All Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run with coverage
npm run test:integration:coverage

# Run specific test suite
npm run test:integration:auth
npm run test:integration:farm
npm run test:integration:task
npm run test:integration:equipment
npm run test:integration:notification
npm run test:integration:user
```

### Running Individual Test Files

```bash
# Run specific test file
npx jest tests/integration/routes/auth.integration.test.js

# Run with verbose output
npx jest tests/integration/routes/auth.integration.test.js --verbose

# Run with coverage
npx jest tests/integration/routes/auth.integration.test.js --coverage
```

### Test Runner Script

```bash
# Run the custom test runner
node tests/integration/test-runner.js
```

## Test Configuration

### Jest Configuration
- **Timeout**: 30 seconds per test suite
- **Environment**: Node.js
- **Setup**: Uses `tests/setup.js` for database initialization
- **Coverage**: Generates coverage reports in `coverage/integration/`

### Database Setup
- Uses MongoDB Memory Server for isolated testing
- Automatic database cleanup between tests
- Test data creation in `beforeEach` hooks

### Authentication Setup
- JWT token generation for different user roles
- Automatic token injection in test requests
- Role-based access testing

## Test Data Management

### Test Users
- **Admin User**: Full system access
- **Farmer User**: Farm-specific access
- **Expert User**: Technical advisory access
- **Farm Admin User**: Farm management access

### Test Entities
- **Farms**: Test farm data with various statuses
- **Equipment**: Test equipment with different categories and statuses
- **Tasks**: Test tasks with different priorities and assignments
- **Notifications**: Test notifications for different users

## Best Practices

### Test Organization
- Each test file focuses on a specific domain
- Tests are organized by HTTP method and endpoint
- Clear test descriptions using `describe` and `it` blocks

### Data Isolation
- Each test creates its own test data
- Database is cleaned between tests
- No test dependencies between files

### Error Testing
- Tests both success and failure scenarios
- Validates error messages and status codes
- Tests edge cases and boundary conditions

### Performance
- Tests are optimized for speed
- Minimal database operations per test
- Efficient test data setup

## Debugging Tests

### Common Issues

1. **Database Connection**: Ensure MongoDB Memory Server is working
2. **JWT Tokens**: Check token generation and validation
3. **Test Data**: Verify test data creation and cleanup
4. **Async Operations**: Ensure proper async/await usage

### Debug Commands

```bash
# Run tests with debug output
DEBUG=* npm run test:integration

# Run single test with verbose output
npx jest tests/integration/routes/auth.integration.test.js --verbose --no-coverage

# Run tests with specific pattern
npx jest --testNamePattern="should login successfully"
```

## Coverage Reports

After running tests with coverage, view the reports:

```bash
# Open coverage report in browser
open coverage/integration/lcov-report/index.html

# View coverage summary
cat coverage/integration/coverage-summary.json
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Integration Tests
  run: |
    npm install
    npm run test:integration:coverage
```

## Contributing

When adding new features:

1. **Add Integration Tests**: Create tests for new endpoints
2. **Update Test Runner**: Add new test files to the runner
3. **Maintain Coverage**: Ensure new code is covered by tests
4. **Follow Patterns**: Use existing test patterns and conventions

## Test Maintenance

### Regular Tasks
- Update test data as models evolve
- Add tests for new features
- Refactor tests for better organization
- Update test documentation

### Performance Optimization
- Monitor test execution time
- Optimize slow tests
- Remove redundant test cases
- Update test data generation
