import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { authApi } from '../auth.api';

// Mock API server
const server = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json({
      message: 'Login successful',
      token: 'mock-jwt-token',
      user: {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'customer',
        isEmailVerified: true,
        isActive: true
      },
      redirectPath: '/customer/dashboard'
    }));
  }),

  rest.post('/api/auth/register/customer', (req, res, ctx) => {
    return res(ctx.json({
      message: 'Customer registered successfully',
      token: 'mock-jwt-token',
      user: {
        id: '123',
        firstName: 'John',
        lastName: 'Doe', 
        email: 'john@example.com',
        role: 'customer',
        isEmailVerified: false
      }
    }));
  }),

  rest.get('/api/auth/me', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(ctx.status(401), ctx.json({ error: 'Access token required' }));
    }

    return res(ctx.json({
      user: {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'customer',
        isEmailVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      profile: {
        userId: '123',
        preferences: {},
        loyaltyPoints: { total: 0, available: 0 }
      }
    }));
  }),

  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(ctx.json({
      message: 'Logout successful'
    }));
  }),

  rest.post('/api/auth/forgot-password', (req, res, ctx) => {
    return res(ctx.json({
      message: 'Password reset email sent successfully'
    }));
  }),

  rest.post('/api/auth/resend-verification', (req, res, ctx) => {
    return res(ctx.json({
      message: 'Verification email sent successfully'
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Auth API Service', () => {
  describe('login', () => {
    it('should login successfully', async () => {
      const result = await authApi.login('john@example.com', 'password');
      
      expect(result.message).toBe('Login successful');
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('john@example.com');
      expect(result.redirectPath).toBe('/customer/dashboard');
    });

    it('should handle login error', async () => {
      server.use(
        rest.post('/api/auth/login', (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({ error: 'Invalid credentials' })
          );
        })
      );

      await expect(authApi.login('john@example.com', 'wrong'))
        .rejects.toThrow();
    });
  });

  describe('registerCustomer', () => {
    it('should register customer successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        phone: '1234567890',
        agreeToTerms: true,
        agreeToPrivacy: true
      };

      const result = await authApi.registerCustomer(userData);
      
      expect(result.message).toBe('Customer registered successfully');
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('john@example.com');
      expect(result.user.role).toBe('customer');
    });

    it('should handle registration validation errors', async () => {
      server.use(
        rest.post('/api/auth/register/customer', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({ 
              error: 'Validation failed',
              details: [
                { field: 'email', message: 'Invalid email format' },
                { field: 'password', message: 'Password too weak' }
              ]
            })
          );
        })
      );

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: '123',
        phone: '1234567890',
        agreeToTerms: true,
        agreeToPrivacy: true
      };

      await expect(authApi.registerCustomer(userData))
        .rejects.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user with valid token', async () => {
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => 'mock-token'),
          setItem: jest.fn(),
          removeItem: jest.fn()
        }
      });

      const result = await authApi.getCurrentUser();
      
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('john@example.com');
      expect(result.profile).toBeDefined();
    });

    it('should handle unauthorized access', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(),
          removeItem: jest.fn()
        }
      });

      await expect(authApi.getCurrentUser())
        .rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => 'mock-token'),
          setItem: jest.fn(),
          removeItem: jest.fn()
        }
      });

      const result = await authApi.logout();
      
      expect(result.message).toBe('Logout successful');
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password email', async () => {
      const result = await authApi.forgotPassword('john@example.com');
      
      expect(result.message).toBe('Password reset email sent successfully');
    });
  });

  describe('resendVerification', () => {
    it('should resend verification email', async () => {
      const result = await authApi.resendVerification('john@example.com');
      
      expect(result.message).toBe('Verification email sent successfully');
    });
  });
});