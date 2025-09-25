import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../authStore';

// Mock the AuthService
jest.mock('../../services/AuthService', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    forgotPassword: jest.fn(),
    resendVerification: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  }
}));

import authService from '../../services/AuthService';
const mockAuthService = authService as jest.Mocked<typeof authService>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('Auth Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Reset store state
    useAuthStore.setState({
      user: null,
      customerProfile: null,
      providerProfile: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      errors: []
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '123',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: 'customer' as const,
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
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login({ email: 'john@example.com', password: 'password' });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('john@example.com');
      expect(result.current.tokens?.accessToken).toBe('mock-access-token');
      expect(result.current.customerProfile).toBeDefined();
    });

    it('should handle login failure', async () => {
      mockAuthApi.login.mockRejectedValue({
        response: { data: { error: 'Invalid credentials' } }
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const loginResult = await result.current.login('john@example.com', 'wrong');
        expect(loginResult.success).toBe(false);
        expect(loginResult.error).toBe('Invalid credentials');
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.errors).toContain('Invalid credentials');
    });

    it('should handle network errors', async () => {
      mockAuthApi.login.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const loginResult = await result.current.login('john@example.com', 'password');
        expect(loginResult.success).toBe(false);
        expect(loginResult.error).toBe('Network error. Please try again.');
      });
    });
  });

  describe('registerCustomer', () => {
    it('should register customer successfully', async () => {
      const mockResponse = {
        message: 'Customer registered successfully',
        token: 'mock-token',
        user: {
          id: '123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'customer' as const,
          isEmailVerified: false,
          isActive: true
        }
      };

      mockAuthApi.registerCustomer.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        phone: '1234567890',
        agreeToTerms: true,
        agreeToPrivacy: true
      };

      await act(async () => {
        const registerResult = await result.current.registerCustomer(userData);
        expect(registerResult.success).toBe(true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('john@example.com');
      expect(result.current.user?.role).toBe('customer');
    });

    it('should handle validation errors', async () => {
      mockAuthApi.registerCustomer.mockRejectedValue({
        response: { 
          data: { 
            error: 'Validation failed',
            details: [
              { field: 'email', message: 'Invalid email format' },
              { field: 'password', message: 'Password too weak' }
            ]
          }
        }
      });

      const { result } = renderHook(() => useAuthStore());

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: '123',
        phone: '1234567890',
        agreeToTerms: true,
        agreeToPrivacy: true
      };

      await act(async () => {
        const registerResult = await result.current.registerCustomer(userData);
        expect(registerResult.success).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.errors.length).toBeGreaterThan(0);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockAuthApi.logout.mockResolvedValue({ message: 'Logout successful' });

      const { result } = renderHook(() => useAuthStore());

      // Set initial authenticated state
      act(() => {
        useAuthStore.setState({
          user: { id: '123' } as any,
          token: 'mock-token',
          isAuthenticated: true
        });
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.token).toBe(null);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });

    it('should handle logout errors gracefully', async () => {
      mockAuthApi.logout.mockRejectedValue(new Error('Logout failed'));

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        useAuthStore.setState({
          user: { id: '123' } as any,
          token: 'mock-token',
          isAuthenticated: true
        });
      });

      await act(async () => {
        await result.current.logout();
      });

      // Should still clear local state even if API call fails
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.token).toBe(null);
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user if token exists', async () => {
      localStorageMock.getItem.mockReturnValue('mock-token');
      mockAuthApi.getCurrentUser.mockResolvedValue({
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
        profile: { userId: '123' }
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.getCurrentUser();
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('john@example.com');
      expect(result.current.profile).toBeDefined();
    });

    it('should clear auth state if no token', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.getCurrentUser();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });

    it('should handle invalid token', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-token');
      mockAuthApi.getCurrentUser.mockRejectedValue({
        response: { status: 401, data: { error: 'Invalid token' } }
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.getCurrentUser();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('initialize', () => {
    it('should initialize with existing token', async () => {
      localStorageMock.getItem.mockReturnValue('existing-token');
      mockAuthApi.getCurrentUser.mockResolvedValue({
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
        profile: { userId: '123' }
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.isInitialized).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe('existing-token');
    });

    it('should initialize without token', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.isInitialized).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        useAuthStore.setState({
          errors: ['Error 1', 'Error 2']
        });
      });

      expect(result.current.errors.length).toBe(2);

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errors.length).toBe(0);
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password email successfully', async () => {
      mockAuthApi.forgotPassword.mockResolvedValue({
        message: 'Password reset email sent successfully'
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.forgotPassword('john@example.com');
        expect(response.success).toBe(true);
        expect(response.message).toBe('Password reset email sent successfully');
      });
    });

    it('should handle forgot password errors', async () => {
      mockAuthApi.forgotPassword.mockRejectedValue({
        response: { data: { error: 'Email not found' } }
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.forgotPassword('nonexistent@example.com');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Email not found');
      });
    });
  });

  describe('resendVerification', () => {
    it('should resend verification email successfully', async () => {
      mockAuthApi.resendVerification.mockResolvedValue({
        message: 'Verification email sent successfully'
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.resendVerification('john@example.com');
        expect(response.success).toBe(true);
        expect(response.message).toBe('Verification email sent successfully');
      });
    });
  });
});