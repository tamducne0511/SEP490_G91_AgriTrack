const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');

// Import the test app without database connection
const app = require('./test-app');

describe('Debug Token Test', () => {
  let adminUser, adminToken;

  beforeEach(async () => {
    // Create admin user
    const adminPassword = await bcrypt.hash('password123', 10);
    adminUser = await User.create({
      email: 'admin@example.com',
      fullName: 'Admin User',
      password: adminPassword,
      role: 'admin',
      status: true
    });

    // Generate token
    adminToken = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET || 'test-secret-key-for-integration-tests',
      { expiresIn: '1h' }
    );

    console.log('Debug: JWT_SECRET =', process.env.JWT_SECRET);
    console.log('Debug: Admin token =', adminToken);
    console.log('Debug: Admin user role =', adminUser.role);
  });

  it('should test token with auth route', async () => {
    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    console.log('Debug: Auth response =', response.body);
    expect(response.body).toHaveProperty('message', 'User retrieved successfully');
  });

  it('should test token with farm route', async () => {
    const response = await request(app)
      .get('/admin/farms')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    console.log('Debug: Farm response =', response.body);
    expect(response.body).toHaveProperty('messag', 'Get list successfully');
  });
});
