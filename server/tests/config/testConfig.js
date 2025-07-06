// Test configuration constants
const TEST_CONFIG = {
  // Database
  DB_NAME: 'agritrack_test',
  
  // Test user credentials
  TEST_USER: {
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
    phone: '1234567890',
    address: 'Test Address',
    gender: 'male',
    birthday: '1990-01-01',
    role: 'farmer'
  },
  
  // Test admin credentials
  TEST_ADMIN: {
    email: 'admin@test.com',
    password: 'admin123',
    fullName: 'Test Admin',
    phone: '9876543210',
    address: 'Admin Address',
    gender: 'male',
    birthday: '1985-01-01',
    role: 'admin'
  },
  
  // Test farm data
  TEST_FARM: {
    name: 'Test Farm',
    description: 'Test farm for unit testing',
    address: 'Test Farm Address',
    area: 100
  },
  
  // Test garden data
  TEST_GARDEN: {
    name: 'Test Garden',
    description: 'Test garden for unit testing',
    area: 50
  },
  
  // Test task data
  TEST_TASK: {
    name: 'Test Task',
    description: 'Test task for unit testing',
    type: 'maintenance',
    priority: 'medium',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  
  // Test equipment data
  TEST_EQUIPMENT: {
    name: 'Test Equipment',
    description: 'Test equipment for unit testing',
    category: 'tools',
    status: 'available'
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },
  
  // File upload
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    UPLOAD_PATH: 'uploads/test'
  },
  
  // JWT
  JWT: {
    SECRET: 'test-secret-key',
    EXPIRES_IN: '1h'
  },
  
  // Validation
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    PHONE_REGEX: /^[0-9]{10,11}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  
  // Error messages
  ERROR_MESSAGES: {
    USER_NOT_FOUND: 'User not found',
    FARM_NOT_FOUND: 'Farm not found',
    TASK_NOT_FOUND: 'Task not found',
    UNAUTHORIZED: 'Unauthorized',
    VALIDATION_ERROR: 'Validation error',
    EMAIL_EXISTS: 'Email already exists',
    INVALID_CREDENTIALS: 'Invalid email or password'
  },
  
  // Success messages
  SUCCESS_MESSAGES: {
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    FARM_CREATED: 'Farm created successfully',
    FARM_UPDATED: 'Farm updated successfully',
    FARM_DELETED: 'Farm deleted successfully',
    TASK_CREATED: 'Task created successfully',
    TASK_UPDATED: 'Task updated successfully',
    TASK_DELETED: 'Task deleted successfully',
    LOGIN_SUCCESS: 'Login successful',
    PASSWORD_CHANGED: 'Password changed successfully'
  }
};

// Test utilities
const TEST_UTILS = {
  // Generate test data
  generateTestData: (type, overrides = {}) => {
    const baseData = TEST_CONFIG[`TEST_${type.toUpperCase()}`];
    return { ...baseData, ...overrides };
  },
  
  // Generate pagination parameters
  generatePaginationParams: (page = 1, limit = 10) => ({
    page: parseInt(page),
    limit: parseInt(limit)
  }),
  
  // Generate search parameters
  generateSearchParams: (keyword = '', filters = {}) => ({
    keyword,
    ...filters
  }),
  
  // Generate file upload data
  generateFileUploadData: (filename = 'test.jpg', mimetype = 'image/jpeg') => ({
    fieldname: 'file',
    originalname: filename,
    encoding: '7bit',
    mimetype,
    buffer: Buffer.from('fake-file-data'),
    size: 1024
  }),
  
  // Generate JWT payload
  generateJWTPayload: (user) => ({
    id: user._id,
    email: user.email,
    role: user.role
  }),
  
  // Generate validation errors
  generateValidationErrors: (field, message) => [{
    field,
    message,
    value: ''
  }]
};

module.exports = {
  TEST_CONFIG,
  TEST_UTILS
}; 