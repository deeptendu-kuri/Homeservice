import request from 'supertest';
import { app } from '../app';
import mongoose from 'mongoose';
import User from '../models/user.model';
import Service from '../models/service.model';
import Booking from '../models/booking.model';
import Availability from '../models/availability.model';

// Test database setup
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/homeservice_test';

// Test data
let customerUser: any;
let providerUser: any;
let testService: any;
let customerToken: string;
let providerToken: string;

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(MONGODB_TEST_URI);
});

beforeEach(async () => {
  // Clean up database
  await User.deleteMany({});
  await Service.deleteMany({});
  await Booking.deleteMany({});
  await Availability.deleteMany({});

  // Create test customer
  customerUser = await User.create({
    firstName: 'John',
    lastName: 'Doe',
    email: 'customer@test.com',
    password: 'Password123!',
    role: 'customer',
    isEmailVerified: true,
    loyaltySystem: {
      totalCoins: 100,
      tier: 'Bronze',
      pointsHistory: []
    }
  });

  // Create test provider
  providerUser = await User.create({
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'provider@test.com',
    password: 'Password123!',
    role: 'provider',
    isEmailVerified: true,
    providerProfile: {
      businessInfo: {
        businessName: 'Smith Cleaning',
        businessType: 'individual',
        description: 'Professional cleaning services'
      },
      verificationStatus: {
        overall: 'approved'
      }
    }
  });

  // Create test service
  testService = await Service.create({
    name: 'House Cleaning',
    category: 'Cleaning',
    description: 'Professional house cleaning service',
    duration: 120, // 2 hours
    price: {
      amount: 100,
      currency: 'USD',
      type: 'fixed'
    },
    providerId: providerUser._id,
    location: {
      address: {
        street: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US'
      }
    },
    isActive: true,
    searchMetadata: {
      bookingCount: 0
    }
  });

  // Create provider availability
  await Availability.create({
    providerId: providerUser._id,
    weeklySchedule: {
      monday: {
        isAvailable: true,
        timeSlots: [{ start: '09:00', end: '17:00', isActive: true }]
      },
      tuesday: {
        isAvailable: true,
        timeSlots: [{ start: '09:00', end: '17:00', isActive: true }]
      },
      wednesday: {
        isAvailable: true,
        timeSlots: [{ start: '09:00', end: '17:00', isActive: true }]
      },
      thursday: {
        isAvailable: true,
        timeSlots: [{ start: '09:00', end: '17:00', isActive: true }]
      },
      friday: {
        isAvailable: true,
        timeSlots: [{ start: '09:00', end: '17:00', isActive: true }]
      },
      saturday: { isAvailable: false, timeSlots: [] },
      sunday: { isAvailable: false, timeSlots: [] }
    }
  });

  // Generate auth tokens (simplified - you may need to adjust based on your auth implementation)
  customerToken = 'customer-test-token'; // Replace with actual token generation
  providerToken = 'provider-test-token'; // Replace with actual token generation
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Booking System API Tests', () => {

  // ===================================
  // BOOKING CREATION TESTS
  // ===================================

  describe('POST /api/bookings', () => {
    test('should create a new booking successfully', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const bookingData = {
        serviceId: testService._id.toString(),
        providerId: providerUser._id.toString(),
        scheduledDate: tomorrow.toISOString().split('T')[0],
        scheduledTime: '10:00',
        location: {
          type: 'customer_address',
          address: {
            street: '456 Customer St',
            city: 'Customer City',
            state: 'CS',
            zipCode: '67890',
            country: 'US'
          }
        },
        customerInfo: {
          phone: '+1234567890'
        }
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.booking).toBeDefined();
      expect(response.body.data.booking.bookingNumber).toMatch(/^[A-Z]{2}-\d{8}-\d{3}$/);
      expect(response.body.data.booking.status).toBe('pending');
    });

    test('should fail with invalid service ID', async () => {
      const bookingData = {
        serviceId: new mongoose.Types.ObjectId().toString(),
        providerId: providerUser._id.toString(),
        scheduledDate: '2024-12-25',
        scheduledTime: '10:00',
        location: {
          type: 'customer_address',
          address: {
            street: '456 Customer St',
            city: 'Customer City',
            state: 'CS',
            zipCode: '67890',
            country: 'US'
          }
        },
        customerInfo: {
          phone: '+1234567890'
        }
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(bookingData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Service not found');
    });

    test('should fail when provider is not available', async () => {
      const bookingData = {
        serviceId: testService._id.toString(),
        providerId: providerUser._id.toString(),
        scheduledDate: '2024-12-25', // Christmas - should be unavailable
        scheduledTime: '20:00', // Outside business hours
        location: {
          type: 'customer_address',
          address: {
            street: '456 Customer St',
            city: 'Customer City',
            state: 'CS',
            zipCode: '67890',
            country: 'US'
          }
        },
        customerInfo: {
          phone: '+1234567890'
        }
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not available');
    });
  });

  // ===================================
  // BOOKING MANAGEMENT TESTS
  // ===================================

  describe('Booking Lifecycle Management', () => {
    let testBooking: any;

    beforeEach(async () => {
      // Create a test booking
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      testBooking = await Booking.create({
        customerId: customerUser._id,
        providerId: providerUser._id,
        serviceId: testService._id,
        scheduledDate: tomorrow,
        scheduledTime: '10:00',
        duration: 120,
        estimatedEndTime: new Date(tomorrow.getTime() + 120 * 60 * 1000),
        location: {
          type: 'customer_address',
          address: {
            street: '456 Customer St',
            city: 'Customer City',
            state: 'CS',
            zipCode: '67890',
            country: 'US'
          }
        },
        pricing: {
          basePrice: 100,
          addOns: [],
          discounts: [],
          subtotal: 100,
          tax: 18,
          totalAmount: 118,
          currency: 'USD'
        },
        customerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'customer@test.com',
          phone: '+1234567890'
        },
        cancellationPolicy: {
          allowedUntil: new Date(tomorrow.getTime() - 24 * 60 * 60 * 1000),
          refundPercentage: 100,
          cancellationFee: 0
        },
        status: 'pending'
      });
    });

    test('should allow provider to accept booking', async () => {
      const response = await request(app)
        .patch(`/api/bookings/${testBooking._id}/accept`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ notes: 'Looking forward to providing excellent service!' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.booking.status).toBe('confirmed');
    });

    test('should allow provider to reject booking', async () => {
      const response = await request(app)
        .patch(`/api/bookings/${testBooking._id}/reject`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ reason: 'Unfortunately not available at that time' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.booking.status).toBe('cancelled');
    });

    test('should allow customer to cancel booking', async () => {
      const response = await request(app)
        .patch(`/api/bookings/${testBooking._id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Change of plans' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.booking.status).toBe('cancelled');
    });

    test('should allow provider to complete booking', async () => {
      // First accept the booking
      testBooking.status = 'confirmed';
      await testBooking.save();

      const response = await request(app)
        .patch(`/api/bookings/${testBooking._id}/complete`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ notes: 'Service completed successfully' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.booking.status).toBe('completed');

      // Verify loyalty points were awarded
      const updatedCustomer = await User.findById(customerUser._id);
      expect(updatedCustomer.loyaltySystem.totalCoins).toBeGreaterThan(100);
    });
  });

  // ===================================
  // BOOKING RETRIEVAL TESTS
  // ===================================

  describe('GET /api/bookings/customer', () => {
    test('should retrieve customer bookings', async () => {
      // Create test bookings
      await Booking.create({
        customerId: customerUser._id,
        providerId: providerUser._id,
        serviceId: testService._id,
        scheduledDate: new Date(),
        scheduledTime: '10:00',
        duration: 120,
        estimatedEndTime: new Date(),
        location: { type: 'customer_address', address: { street: '123', city: 'Test', state: 'TS', zipCode: '12345', country: 'US' } },
        pricing: { basePrice: 100, addOns: [], discounts: [], subtotal: 100, tax: 18, totalAmount: 118, currency: 'USD' },
        customerInfo: { firstName: 'John', lastName: 'Doe', email: 'test@test.com', phone: '1234567890' },
        cancellationPolicy: { allowedUntil: new Date(), refundPercentage: 100, cancellationFee: 0 },
        status: 'completed'
      });

      const response = await request(app)
        .get('/api/bookings/customer')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookings).toHaveLength(1);
      expect(response.body.data.pagination).toBeDefined();
    });
  });

  describe('GET /api/bookings/provider', () => {
    test('should retrieve provider bookings', async () => {
      const response = await request(app)
        .get('/api/bookings/provider')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.bookings)).toBe(true);
    });
  });

  // ===================================
  // BOOKING COMMUNICATION TESTS
  // ===================================

  describe('POST /api/bookings/:id/messages', () => {
    let testBooking: any;

    beforeEach(async () => {
      testBooking = await Booking.create({
        customerId: customerUser._id,
        providerId: providerUser._id,
        serviceId: testService._id,
        scheduledDate: new Date(),
        scheduledTime: '10:00',
        duration: 120,
        estimatedEndTime: new Date(),
        location: { type: 'customer_address', address: { street: '123', city: 'Test', state: 'TS', zipCode: '12345', country: 'US' } },
        pricing: { basePrice: 100, addOns: [], discounts: [], subtotal: 100, tax: 18, totalAmount: 118, currency: 'USD' },
        customerInfo: { firstName: 'John', lastName: 'Doe', email: 'test@test.com', phone: '1234567890' },
        cancellationPolicy: { allowedUntil: new Date(), refundPercentage: 100, cancellationFee: 0 },
        status: 'confirmed'
      });
    });

    test('should allow customer to send message', async () => {
      const response = await request(app)
        .post(`/api/bookings/${testBooking._id}/messages`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ message: 'Hello, I have a question about the service' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messageCount).toBe(1);
    });

    test('should fail with empty message', async () => {
      const response = await request(app)
        .post(`/api/bookings/${testBooking._id}/messages`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ message: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});

// ===================================
// AVAILABILITY SYSTEM TESTS
// ===================================

describe('Availability System API Tests', () => {

  describe('GET /api/availability', () => {
    test('should retrieve provider availability', async () => {
      const response = await request(app)
        .get('/api/availability')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.availability).toBeDefined();
      expect(response.body.data.availability.weeklySchedule).toBeDefined();
    });
  });

  describe('PUT /api/availability/schedule', () => {
    test('should update weekly schedule', async () => {
      const newSchedule = {
        weeklySchedule: {
          monday: {
            isAvailable: true,
            timeSlots: [
              { start: '08:00', end: '12:00', isActive: true },
              { start: '13:00', end: '17:00', isActive: true }
            ]
          }
        }
      };

      const response = await request(app)
        .put('/api/availability/schedule')
        .set('Authorization', `Bearer ${providerToken}`)
        .send(newSchedule)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.availability.weeklySchedule.monday.timeSlots).toHaveLength(2);
    });

    test('should fail with overlapping time slots', async () => {
      const invalidSchedule = {
        weeklySchedule: {
          monday: {
            isAvailable: true,
            timeSlots: [
              { start: '09:00', end: '13:00', isActive: true },
              { start: '12:00', end: '16:00', isActive: true } // Overlaps with previous
            ]
          }
        }
      };

      const response = await request(app)
        .put('/api/availability/schedule')
        .set('Authorization', `Bearer ${providerToken}`)
        .send(invalidSchedule)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('overlap');
    });
  });

  describe('POST /api/availability/override', () => {
    test('should add date override', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const overrideData = {
        date: tomorrow.toISOString().split('T')[0],
        isAvailable: false,
        reason: 'vacation'
      };

      const response = await request(app)
        .post('/api/availability/override')
        .set('Authorization', `Bearer ${providerToken}`)
        .send(overrideData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('override added');
    });
  });

  describe('GET /api/availability/provider/:providerId/slots', () => {
    test('should return available slots for provider', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app)
        .get(`/api/availability/provider/${providerUser._id}/slots`)
        .query({
          date: tomorrow.toISOString().split('T')[0],
          duration: 60
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.availableSlots).toBeDefined();
    });
  });

  describe('GET /api/availability/provider/:providerId/check', () => {
    test('should check specific time slot availability', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app)
        .get(`/api/availability/provider/${providerUser._id}/check`)
        .query({
          date: tomorrow.toISOString().split('T')[0],
          time: '10:00',
          duration: 60
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.available).toBeDefined();
    });
  });
});

// ===================================
// VALIDATION TESTS
// ===================================

describe('Validation Middleware Tests', () => {

  test('should validate booking input correctly', async () => {
    const invalidBookingData = {
      serviceId: 'invalid-id',
      providerId: providerUser._id.toString(),
      scheduledDate: 'invalid-date',
      scheduledTime: '25:00', // Invalid time
      location: {
        type: 'invalid_type',
        address: {} // Missing required fields
      }
    };

    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(invalidBookingData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation error');
    expect(response.body.errors).toBeDefined();
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  test('should validate availability input correctly', async () => {
    const invalidSchedule = {
      weeklySchedule: {
        monday: {
          timeSlots: [
            { start: 'invalid-time', end: '17:00' }
          ]
        }
      }
    };

    const response = await request(app)
      .put('/api/availability/schedule')
      .set('Authorization', `Bearer ${providerToken}`)
      .send(invalidSchedule)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });
});

// ===================================
// INTEGRATION TESTS
// ===================================

describe('Integration with Existing Models', () => {

  test('should increment service booking count on completion', async () => {
    // Create and complete a booking
    const booking = await Booking.create({
      customerId: customerUser._id,
      providerId: providerUser._id,
      serviceId: testService._id,
      scheduledDate: new Date(),
      scheduledTime: '10:00',
      duration: 120,
      estimatedEndTime: new Date(),
      location: { type: 'customer_address', address: { street: '123', city: 'Test', state: 'TS', zipCode: '12345', country: 'US' } },
      pricing: { basePrice: 100, addOns: [], discounts: [], subtotal: 100, tax: 18, totalAmount: 118, currency: 'USD' },
      customerInfo: { firstName: 'John', lastName: 'Doe', email: 'test@test.com', phone: '1234567890' },
      cancellationPolicy: { allowedUntil: new Date(), refundPercentage: 100, cancellationFee: 0 },
      status: 'confirmed'
    });

    const initialBookingCount = testService.searchMetadata.bookingCount;

    await booking.markAsCompleted();

    const updatedService = await Service.findById(testService._id);
    expect(updatedService.searchMetadata.bookingCount).toBe(initialBookingCount + 1);
  });

  test('should award loyalty points to customer on booking completion', async () => {
    const initialCoins = customerUser.loyaltySystem.totalCoins;

    const booking = await Booking.create({
      customerId: customerUser._id,
      providerId: providerUser._id,
      serviceId: testService._id,
      scheduledDate: new Date(),
      scheduledTime: '10:00',
      duration: 120,
      estimatedEndTime: new Date(),
      location: { type: 'customer_address', address: { street: '123', city: 'Test', state: 'TS', zipCode: '12345', country: 'US' } },
      pricing: { basePrice: 100, addOns: [], discounts: [], subtotal: 100, tax: 18, totalAmount: 118, currency: 'USD' },
      customerInfo: { firstName: 'John', lastName: 'Doe', email: 'test@test.com', phone: '1234567890' },
      cancellationPolicy: { allowedUntil: new Date(), refundPercentage: 100, cancellationFee: 0 },
      status: 'confirmed'
    });

    await booking.markAsCompleted();

    const updatedCustomer = await User.findById(customerUser._id);
    expect(updatedCustomer.loyaltySystem.totalCoins).toBeGreaterThan(initialCoins);

    // Check that a loyalty points history entry was created
    const pointsHistory = updatedCustomer.loyaltySystem.pointsHistory;
    const latestEntry = pointsHistory[pointsHistory.length - 1];
    expect(latestEntry.type).toBe('earned');
    expect(latestEntry.source).toBe('booking_completion');
    expect(latestEntry.relatedBooking.toString()).toBe(booking._id.toString());
  });
});