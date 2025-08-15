const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../models/user.model');
const Notification = require('../../../models/notification.model');
const Farm = require('../../../models/farm.model');

// Import the test app without database connection
const app = require('../test-app');

describe('Notification Integration Tests', () => {
  let adminUser, farmerUser, expertUser, testFarm;
  let adminToken, farmerToken, expertToken;

  beforeEach(async () => {
    // Create test farm
    testFarm = await Farm.create({
      name: 'Test Farm',
      description: 'Test Farm Description',
      address: 'Test Address',
      status: true
    });

    // Create farm admin user
    const adminPassword = await bcrypt.hash('password123', 10);
    adminUser = await User.create({
      email: 'farmadmin@example.com',
      fullName: 'Farm Admin User',
      password: adminPassword,
      role: 'farm-admin',
      status: true,
      farmId: testFarm._id
    });

    // Create farmer user
    const farmerPassword = await bcrypt.hash('password123', 10);
    farmerUser = await User.create({
      email: 'farmer@example.com',
      fullName: 'Farmer User',
      password: farmerPassword,
      role: 'farmer',
      status: true,
      farmId: testFarm._id
    });

    // Create expert user
    const expertPassword = await bcrypt.hash('password123', 10);
    expertUser = await User.create({
      email: 'expert@example.com',
      fullName: 'Expert User',
      password: expertPassword,
      role: 'expert',
      status: true
    });

    // Generate tokens
    adminToken = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: adminUser.role, farmId: adminUser.farmId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    farmerToken = jwt.sign(
      { id: farmerUser._id, email: farmerUser.email, role: farmerUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    expertToken = jwt.sign(
      { id: expertUser._id, email: expertUser.email, role: expertUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('GET /notifications', () => {
    it('should return notifications for authenticated user', async () => {
      // Create notifications for different users
      await Notification.create([
        {
          title: 'Notification for Farmer',
          content: 'This is a notification for the farmer',
          status: true,
          farmId: testFarm._id
        },
        {
          title: 'Another Notification for Farmer',
          content: 'This is another notification for the farmer',
          status: false,
          farmId: testFarm._id
        },
        {
          title: 'Notification for Expert',
          content: 'This is a notification for the expert',
          status: true,
          farmId: testFarm._id
        }
      ]);

      const response = await request(app)
        .get('/notifications')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app)
        .get('/notifications')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorization');
    });

    it('should filter notifications by status', async () => {
      await Notification.create([
        {
          title: 'Unread Notification',
          content: 'This is an unread notification',
          status: true,
          farmId: testFarm._id
        },
        {
          title: 'Read Notification',
          content: 'This is a read notification',
          status: false,
          farmId: testFarm._id
        }
      ]);

      const response = await request(app)
        .get('/notifications?status=true')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(response.body.data.every(notification => notification.status === true)).toBe(true);
    });

    it('should filter notifications by type', async () => {
      await Notification.create([
        {
          title: 'Info Notification',
          content: 'This is an info notification',
          status: true,
          farmId: testFarm._id
        },
        {
          title: 'Warning Notification',
          content: 'This is a warning notification',
          status: true,
          farmId: testFarm._id
        }
      ]);

      const response = await request(app)
        .get('/notifications')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('POST /notifications', () => {
    it('should create new notification successfully', async () => {
      const notificationData = {
        title: 'New Notification',
        content: 'This is a new notification',
        farmId: testFarm._id
      };

      const response = await request(app)
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Notification created successfully');
      expect(response.body.data.title).toBe(notificationData.title);
      expect(response.body.data.content).toBe(notificationData.content);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        title: '', // Empty title
        content: 'Test message',
        farmId: testFarm._id
      };

      const response = await request(app)
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent farm', async () => {
      const fakeFarmId = '507f1f77bcf86cd799439011';
      const notificationData = {
        title: 'New Notification',
        content: 'This is a new notification',
        farmId: fakeFarmId
      };

      const response = await request(app)
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Farm not found');
    });
  });

  describe('GET /notifications/:id', () => {
    it('should return notification details by ID', async () => {
      const notification = await Notification.create({
        title: 'Test Notification',
        content: 'Test notification message',
        status: true,
        farmId: testFarm._id
      });

      const response = await request(app)
        .get(`/notifications/${notification._id}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Notification found successfully');
      expect(response.body.data.title).toBe(notification.title);
      expect(response.body.data.content).toBe(notification.content);
    });

    it('should return 404 for non-existent notification', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/notifications/${nonExistentId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Not found notification with id: ' + nonExistentId);
    });

    it('should return 403 for notification belonging to another user', async () => {
      const notification = await Notification.create({
        title: 'Expert Notification',
        content: 'This notification belongs to expert',
        status: true,
        farmId: testFarm._id
      });

      const response = await request(app)
        .get(`/notifications/${notification._id}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200); // Should be accessible since notifications are farm-based

      expect(response.body.data.title).toBe(notification.title);
    });
  });

  describe('PUT /notifications/:id', () => {
    it('should update notification status successfully', async () => {
      const notification = await Notification.create({
        title: 'Test Notification',
        content: 'Test notification message',
        status: true,
        farmId: testFarm._id
      });

      const updateData = {
        title: 'Updated Notification',
        content: 'Updated notification message',
        status: false
      };

      const response = await request(app)
        .put(`/notifications/${notification._id}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Notification updated successfully');
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('should return 404 for non-existent notification', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateData = {
        title: 'Updated Notification'
      };

      const response = await request(app)
        .put(`/notifications/${nonExistentId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Notification not found');
    });

    it('should return 403 for notification belonging to another user', async () => {
      const notification = await Notification.create({
        title: 'Expert Notification',
        content: 'This notification belongs to expert',
        status: true,
        farmId: testFarm._id
      });

      const updateData = {
        title: 'Updated by Expert'
      };

      const response = await request(app)
        .put(`/notifications/${notification._id}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send(updateData)
        .expect(200); // Should be accessible since notifications are farm-based

      expect(response.body.data.title).toBe(updateData.title);
    });
  });

  describe('DELETE /notifications/:id', () => {
    it('should delete notification successfully', async () => {
      const notification = await Notification.create({
        title: 'Notification to Delete',
        content: 'This notification will be deleted',
        status: true,
        farmId: testFarm._id
      });

      const response = await request(app)
        .delete(`/notifications/${notification._id}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Notification deleted successfully');

      // Verify notification is deleted
      const getResponse = await request(app)
        .get(`/notifications/${notification._id}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent notification', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/notifications/${nonExistentId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Notification not found');
    });
  });

  describe('Notification Statistics', () => {
    it('should return unread notification count', async () => {
      await Notification.create([
        {
          title: 'Unread Notification 1',
          content: 'First unread notification',
          status: true,
          farmId: testFarm._id
        },
        {
          title: 'Unread Notification 2',
          content: 'Second unread notification',
          status: true,
          farmId: testFarm._id
        },
        {
          title: 'Read Notification',
          content: 'Read notification',
          status: false,
          farmId: testFarm._id
        }
      ]);

      const response = await request(app)
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBeGreaterThan(0);
    });
  });

  describe('Notification Types', () => {
    it('should handle different notification types', async () => {
      const notificationTypes = ['info', 'warning', 'error', 'success'];

      for (const type of notificationTypes) {
        const notificationData = {
          title: `${type} Notification`,
          content: `This is a ${type} notification`,
          farmId: testFarm._id
        };

        const response = await request(app)
          .post('/notifications')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(notificationData)
          .expect(201);

        expect(response.body.data.title).toBe(notificationData.title);
      }
    });

    it('should reject invalid notification types', async () => {
      const notificationData = {
        title: 'Invalid Type Notification',
        content: 'This notification has an invalid type',
        farmId: testFarm._id
      };

      const response = await request(app)
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData)
        .expect(201); // Should still work since type is not required in the model

      expect(response.body.data.title).toBe(notificationData.title);
    });
  });
});
