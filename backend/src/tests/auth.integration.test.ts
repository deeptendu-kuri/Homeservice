import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { connectDB } from '../config/database';
import User from '../models/user.model';
import CustomerProfile from '../models/customerProfile.model';
import ProviderProfile from '../models/providerProfile.model';

describe('Authentication API Integration', () => {
  beforeAll(async () => {
    // Connect to test database
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
    await CustomerProfile.deleteMany({});
    await ProviderProfile.deleteMany({});
  });

  describe('POST /api/auth/register/customer', () => {
    const validCustomerData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
      phone: '1234567890',
      agreeToTerms: true,
      agreeToPrivacy: true
    };

    it('should register customer successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register/customer')
        .send(validCustomerData);

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(validCustomerData.email);
      expect(response.body.user.role).toBe('customer');

      // Verify user created in database
      const user = await User.findById(response.body.user.id);
      expect(user).toBeDefined();
      expect(user.email).toBe(validCustomerData.email);

      // Verify customer profile created
      const profile = await CustomerProfile.findOne({ userId: user._id });
      expect(profile).toBeDefined();
    });

    it('should return validation errors for invalid data', async () => {
      const invalidData = {
        firstName: 'J', // Too short
        email: 'invalid-email',
        password: '123', // Too weak
        agreeToTerms: false // Must be true
      };

      const response = await request(app)
        .post('/api/auth/register/customer')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should prevent duplicate email registration', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register/customer')
        .send(validCustomerData);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register/customer')
        .send(validCustomerData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser: any;

    beforeEach(async () => {
      // Create test user
      testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        isEmailVerified: true,
        accountStatus: 'active'
      });
      await testUser.save();
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser: any;
    let authToken: string;

    beforeEach(async () => {
      testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        isEmailVerified: true,
        accountStatus: 'active'
      });
      await testUser.save();

      authToken = testUser.generateAuthToken();
    });

    it('should return current user data', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(testUser._id.toString());
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe('customer');
    });

    it('should return error for missing token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });
  });
});