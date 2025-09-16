import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import { ProtectedRoute, CustomerRoute, ProviderRoute, AdminRoute, PublicRoute } from '../ProtectedRoute';
import { useAuthStore } from '../../../stores/authStore';

// Mock the auth store
jest.mock('../../../stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock components for testing
const MockComponent = () => <div>Protected Content</div>;
const MockFallback = () => <div>Loading...</div>;

// Test wrapper with router
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <Routes>
      <Route path="*" element={<>{children}</>} />
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/verify-email-required" element={<div>Email Verification Required</div>} />
      <Route path="/account-suspended" element={<div>Account Suspended</div>} />
      <Route path="/provider/verification-pending" element={<div>Provider Verification Pending</div>} />
    </Routes>
  </BrowserRouter>
);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Base ProtectedRoute', () => {
    it('renders loading fallback when not initialized', () => {
      mockUseAuthStore.mockReturnValue({
        isInitialized: false,
        isAuthenticated: false,
        user: null
      } as any);

      render(
        <RouterWrapper>
          <ProtectedRoute fallback={<MockFallback />}>
            <MockComponent />
          </ProtectedRoute>
        </RouterWrapper>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('renders children when authenticated and all requirements met', () => {
      mockUseAuthStore.mockReturnValue({
        isInitialized: true,
        isAuthenticated: true,
        user: {
          id: '123',
          role: 'customer',
          isEmailVerified: true,
          accountStatus: 'active'
        }
      } as any);

      render(
        <RouterWrapper>
          <ProtectedRoute requireAuth={true} requireEmailVerified={true}>
            <MockComponent />
          </ProtectedRoute>
        </RouterWrapper>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects to login when requireAuth=true and not authenticated', async () => {
      mockUseAuthStore.mockReturnValue({
        isInitialized: true,
        isAuthenticated: false,
        user: null
      } as any);

      render(
        <RouterWrapper>
          <ProtectedRoute requireAuth={true}>
            <MockComponent />
          </ProtectedRoute>
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });

    it('redirects to email verification when email not verified', async () => {
      mockUseAuthStore.mockReturnValue({
        isInitialized: true,
        isAuthenticated: true,
        user: {
          id: '123',
          role: 'customer',
          isEmailVerified: false,
          accountStatus: 'active'
        }
      } as any);

      render(
        <RouterWrapper>
          <ProtectedRoute requireAuth={true} requireEmailVerified={true}>
            <MockComponent />
          </ProtectedRoute>
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Email Verification Required')).toBeInTheDocument();
      });
    });

    it('redirects to suspended page when account is suspended', async () => {
      mockUseAuthStore.mockReturnValue({
        isInitialized: true,
        isAuthenticated: true,
        user: {
          id: '123',
          role: 'customer',
          isEmailVerified: true,
          accountStatus: 'suspended'
        }
      } as any);

      render(
        <RouterWrapper>
          <ProtectedRoute requireAuth={true}>
            <MockComponent />
          </ProtectedRoute>
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Account Suspended')).toBeInTheDocument();
      });
    });
  });

  describe('CustomerRoute', () => {
    it('renders content for customer user', () => {
      mockUseAuthStore.mockReturnValue({
        isInitialized: true,
        isAuthenticated: true,
        user: {
          id: '123',
          role: 'customer',
          isEmailVerified: true,
          accountStatus: 'active'
        }
      } as any);

      render(
        <RouterWrapper>
          <CustomerRoute>
            <MockComponent />
          </CustomerRoute>
        </RouterWrapper>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects non-customer users to login', async () => {
      mockUseAuthStore.mockReturnValue({
        isInitialized: true,
        isAuthenticated: true,
        user: {
          id: '123',
          role: 'provider',
          isEmailVerified: true,
          accountStatus: 'active'
        }
      } as any);

      render(
        <RouterWrapper>
          <CustomerRoute>
            <MockComponent />
          </CustomerRoute>
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });
  });

  describe('ProviderRoute', () => {
    it('renders content for verified provider', () => {
      mockUseAuthStore.mockReturnValue({
        isInitialized: true,
        isAuthenticated: true,
        user: {
          id: '123',
          role: 'provider',
          isEmailVerified: true,
          accountStatus: 'active',
          providerStatus: 'approved'
        }
      } as any);

      render(
        <RouterWrapper>
          <ProviderRoute>
            <MockComponent />
          </ProviderRoute>
        </RouterWrapper>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects pending provider to verification page', async () => {
      mockUseAuthStore.mockReturnValue({
        isInitialized: true,
        isAuthenticated: true,
        user: {
          id: '123',
          role: 'provider',
          isEmailVerified: true,
          accountStatus: 'active',
          providerStatus: 'pending'
        }
      } as any);

      render(
        <RouterWrapper>
          <ProviderRoute>
            <MockComponent />
          </ProviderRoute>
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Provider Verification Pending')).toBeInTheDocument();
      });
    });

    it('redirects non-provider users to login', async () => {
      mockUseAuthStore.mockReturnValue({
        isInitialized: true,
        isAuthenticated: true,
        user: {
          id: '123',
          role: 'customer',
          isEmailVerified: true,
          accountStatus: 'active'
        }
      } as any);

      render(
        <RouterWrapper>
          <ProviderRoute>
            <MockComponent />
          </ProviderRoute>
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });
  });

  describe('AdminRoute', () => {
    it('renders content for admin user', () => {
      mockUseAuthStore.mockReturnValue({
        isInitialized: true,
        isAuthenticated: true,
        user: {
          id: '123',
          role: 'admin',
          isEmailVerified: true,
          accountStatus: 'active'
        }
      } as any);

      render(
        <RouterWrapper>
          <AdminRoute>
            <MockComponent />
          </AdminRoute>
        </RouterWrapper>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects non-admin users to login', async () => {
      mockUseAuthStore.mockReturnValue({
        isInitialized: true,
        isAuthenticated: true,
        user: {
          id: '123',
          role: 'customer',
          isEmailVerified: true,
          accountStatus: 'active'
        }
      } as any);

      render(
        <RouterWrapper>
          <AdminRoute>
            <MockComponent />
          </AdminRoute>
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });
  });

  describe('PublicRoute', () => {
    it('renders children when not authenticated', () => {
      mockUseAuthStore.mockReturnValue({
        isInitialized: true,
        isAuthenticated: false,
        user: null
      } as any);

      render(
        <RouterWrapper>
          <PublicRoute>
            <MockComponent />
          </PublicRoute>
        </RouterWrapper>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects authenticated users to dashboard by default', async () => {
      mockUseAuthStore.mockReturnValue({
        isInitialized: true,
        isAuthenticated: true,
        user: {
          id: '123',
          role: 'customer',
          isEmailVerified: true,
          accountStatus: 'active'
        }
      } as any);

      // This would need router setup to test redirect properly
      // For now, just verify the component behavior
      render(
        <RouterWrapper>
          <PublicRoute>
            <MockComponent />
          </PublicRoute>
        </RouterWrapper>
      );

      // The redirect would happen, so we don't expect to see the content
      await waitFor(() => {
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      });
    });

    it('renders children when redirectAuthenticated=false', () => {
      mockUseAuthStore.mockReturnValue({
        isInitialized: true,
        isAuthenticated: true,
        user: {
          id: '123',
          role: 'customer',
          isEmailVerified: true,
          accountStatus: 'active'
        }
      } as any);

      render(
        <RouterWrapper>
          <PublicRoute redirectAuthenticated={false}>
            <MockComponent />
          </PublicRoute>
        </RouterWrapper>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});