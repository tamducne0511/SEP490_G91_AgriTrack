# News Management Test Suite

This directory contains comprehensive tests for the news management functionality in the AgriTrack application.

## Test Structure

### Unit Tests
- `unit/news.controller.test.js` - Tests for news controller functions
- `unit/news.service.test.js` - Tests for news service layer

### Integration Tests
- `integration/news.test.js` - Main integration tests for news API endpoints
- `integration/news-error-handling.test.js` - Comprehensive error handling tests
- `integration/news-performance.test.js` - Performance and load testing

## Test Coverage

The test suite covers:

### Controller Tests
- ✅ getAllNews - pagination, filters, search
- ✅ getNewsById - success and error cases
- ✅ createNews - validation, authorization, file upload
- ✅ updateNews - authorization, validation, image handling
- ✅ deleteNews - authorization, error handling
- ✅ getPublishedNews - public access
- ✅ getNewsByStatus - status filtering
- ✅ getMyNews - expert's own news

### Service Tests
- ✅ create - news creation with validation
- ✅ findAll - pagination, filtering, search
- ✅ findById - success and not found cases
- ✅ update - news updates with validation
- ✅ remove - news deletion
- ✅ findByStatus - status-based queries
- ✅ getPublishedNews - public news retrieval
- ✅ getNewsByAuthor - author-specific queries

### Integration Tests
- ✅ Authentication and authorization
- ✅ CRUD operations
- ✅ Validation errors
- ✅ Permission checks
- ✅ Error handling
- ✅ Edge cases
- ✅ Performance testing

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Unit tests only
npm test -- tests/unit

# Integration tests only
npm test -- tests/integration

# Specific test file
npm test -- tests/integration/news.test.js
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run in Watch Mode
```bash
npm run test:watch
```

## Test Environment

The tests use:
- **Jest** as the testing framework
- **Supertest** for HTTP assertions
- **MongoDB Memory Server** for in-memory database testing
- **JWT** for authentication testing

## Test Data

Tests create and clean up their own test data:
- Test users (farmer, expert, admin roles)
- Test news articles with various statuses
- JWT tokens for authentication

## Performance Benchmarks

The performance tests ensure:
- Response times under 1 second for most operations
- Memory usage stays within reasonable limits
- Concurrent request handling
- Large dataset performance

## Error Scenarios Tested

- Authentication failures
- Authorization violations
- Validation errors
- Resource not found
- Malformed requests
- Database connection issues
- Permission errors
- Edge cases and boundary conditions

## Best Practices

1. **Isolation**: Each test is independent and cleans up after itself
2. **Mocking**: External dependencies are properly mocked
3. **Coverage**: Comprehensive test coverage for all code paths
4. **Performance**: Performance benchmarks ensure scalability
5. **Security**: Authentication and authorization are thoroughly tested
6. **Error Handling**: All error scenarios are covered
7. **Edge Cases**: Boundary conditions and edge cases are tested

## Maintenance

When adding new features to news management:
1. Add corresponding unit tests for new controller/service methods
2. Add integration tests for new API endpoints
3. Update performance tests if new operations are added
4. Ensure all tests pass before merging
5. Update this README if new test categories are added
