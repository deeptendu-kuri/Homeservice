import { rest } from 'msw';
import { setupServer } from 'msw/node';
import authService from '../AuthService';

// Mock API server
const server = setupServer(
  rest.post(`${process.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: {
        user: {
          id: '123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'customer',
          isEmailVerified: true,
          accountStatus: 'active'
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        },
        profile: {
          userId: '123'
        },
        redirectUrl: '/customer/dashboard'
      },
      message: 'Login successful'
    }));
  }),

  rest.post(`${process.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register/customer`, (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: {
        user: {
          id: '123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'customer',
          isEmailVerified: false,
          accountStatus: 'active'
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        },
        profile: {
          userId: '123'
        }
      },
      message: 'Customer registered successfully'
    }));
  }),

  rest.get(`${process.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(ctx.status(401), ctx.json({ success: false, error: 'Access token required' }));
    }

    return res(ctx.json({
      success: true,
      data: {
        user: {
          id: '123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'customer',
          isEmailVerified: true,
          accountStatus: 'active'
        },
        profile: {
          userId: '123',
          preferences: {},
          loyaltyPoints: { total: 0, available: 0 }
        }
      }
    }));
  }),

  rest.post(`${process.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/logout`, (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      message: 'Logout successful'
    }));
  }),

  rest.post(`${process.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`, (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      message: 'Password reset email sent successfully'
    }));
  }),

  rest.post(`${process.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/resend-verification`, (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      message: 'Verification email sent successfully'
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AuthService', () => {
  describe('login', () => {
    it('should login successfully', async () => {
      const result = await authService.login({ email: 'john@example.com', password: 'password' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Login successful');
      expect(result.data.tokens.accessToken).toBe('mock-access-token');
      expect(result.data.user.email).toBe('john@example.com');
      expect(result.data.redirectUrl).toBe('/customer/dashboard');
    });

    it('should handle login error', async () => {
      server.use(
        rest.post(`${process.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({ success: false, message: 'Invalid credentials' })
          );
        })
      );

      await expect(authService.login({ email: 'john@example.com', password: 'wrong' }))
        .rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should register customer successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        phone: '1234567890',
        role: 'customer' as const,
        agreeToTerms: true,
        agreeToPrivacy: true
      };

      const result = await authService.register(userData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Customer registered successfully');
      expect(result.data.tokens.accessToken).toBe('mock-access-token');
      expect(result.data.user.email).toBe('john@example.com');
      expect(result.data.user.role).toBe('customer');
    });

    it('should handle registration validation errors', async () => {
      server.use(
        rest.post(`${process.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register/customer`, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              success: false,
              message: 'Validation failed'
            })
          );
        })
      );

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: '123',
        confirmPassword: '123',
        phone: '1234567890',
        role: 'customer' as const,
        agreeToTerms: true,
        agreeToPrivacy: true
      };

      await expect(authService.register(userData))
        .rejects.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user with valid token', async () => {
      // Mock localStorage with auth tokens
      const mockAuthData = JSON.stringify({
        state: {
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
          }
        }
      });

      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => mockAuthData),
          setItem: jest.fn(),
          removeItem: jest.fn()
        }
      });

      const result = await authService.getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe('john@example.com');
      expect(result.data.profile).toBeDefined();
    });

    it('should handle unauthorized access', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(),
          removeItem: jest.fn()
        }
      });

      await expect(authService.getCurrentUser())
        .rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => JSON.stringify({
            state: {
              tokens: {
                accessToken: 'mock-access-token'
              }
            }
          })),
          setItem: jest.fn(),
          removeItem: jest.fn()
        }
      });

      await authService.logout();

      // Logout doesn't return a value in the new implementation
      // It handles cleanup internally
      expect(true).toBe(true); // Just verify no error was thrown
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password email', async () => {
      const result = await authService.forgotPassword('john@example.com');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset email sent successfully');
    });
  });

  describe('resendVerification', () => {
    it('should resend verification email', async () => {
      const result = await authService.resendVerification('john@example.com');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Verification email sent successfully');
    });
  });
});