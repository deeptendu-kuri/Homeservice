import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types
export interface User {
  _id: string;
  email: string;
  role: 'customer' | 'provider' | 'admin';
  isEmailVerified: boolean;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  accountStatus: 'active' | 'suspended' | 'deactivated';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  
  // Social features
  followers: number;
  following: number;
  socialProfiles?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  
  // Loyalty system
  loyaltySystem: {
    totalCoins: number;
    availableCoins: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    tierProgress: number;
    referralCode: string;
    totalReferrals: number;
    currentStreak: number;
  };
}

export interface CustomerProfile {
  _id: string;
  userId: string;
  preferences: {
    categories: string[];
    maxDistance: number;
    priceRange: {
      min: number;
      max: number;
    };
    preferredTimes: string[];
    autoBooking: boolean;
  };
  addresses: Array<{
    _id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    isDefault: boolean;
  }>;
  favoriteProviders: string[];
  bookingStats: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    noShowCount: number;
  };
  loyaltyPoints: {
    current: number;
    earned: number;
    redeemed: number;
    expiringPoints: {
      amount: number;
      expiryDate: string;
    };
  };
}

export interface ProviderProfile {
  _id: string;
  userId: string;
  businessInfo: {
    businessName: string;
    businessType: 'individual' | 'small_business' | 'company' | 'franchise';
    description: string;
    tagline?: string;
    website?: string;
    establishedDate?: string;
  };
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  services: Array<{
    name: string;
    category: string;
    subcategory?: string;
    description: string;
    duration: number;
    price: {
      amount: number;
      currency: string;
      type: 'fixed' | 'hourly' | 'custom';
    };
    tags: string[];
  }>;
  locationInfo: {
    primaryAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    serviceRadius: number;
    mobileService: boolean;
    hasFixedLocation: boolean;
  };
  portfolio: Array<{
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    isBeforeAfter: boolean;
    tags: string[];
    uploadedAt: string;
  }>;
  ratings: {
    average: number;
    count: number;
    breakdown: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  earnings: {
    totalEarned: number;
    availableBalance: number;
    pendingBalance: number;
    lastPayout?: string;
  };
  analytics: {
    profileViews: number;
    bookingRequests: number;
    conversionRate: number;
    repeatCustomers: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  loginAs?: 'customer' | 'provider' | 'admin';
}

export interface RegisterCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  referralCode?: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export interface RegisterProviderData extends RegisterCustomerData {
  businessInfo: {
    businessName: string;
    businessType: 'individual' | 'small_business' | 'company' | 'franchise';
    description: string;
    tagline?: string;
    website?: string;
    establishedDate?: string;
    serviceRadius: number;
  };
  locationInfo: {
    primaryAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    mobileService: boolean;
    hasFixedLocation: boolean;
  };
  services: Array<{
    name: string;
    category: string;
    subcategory?: string;
    description: string;
    duration: number;
    price: {
      amount: number;
      currency: string;
      type: 'fixed' | 'hourly' | 'custom';
    };
    tags?: string[];
  }>;
  agreeToBackground: boolean;
}

export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

interface AuthState {
  // State
  user: User | null;
  customerProfile: CustomerProfile | null;
  providerProfile: ProviderProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  errors: AuthError[];
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  registerCustomer: (data: RegisterCustomerData) => Promise<void>;
  registerProvider: (data: RegisterProviderData, files?: FormData) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (data: Partial<User>, files?: FormData) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearErrors: () => void;
  setError: (error: AuthError) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
}

// API Service (will be moved to separate file)
class AuthAPI {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const authStore = useAuthStore.getState();
    if (authStore.tokens?.accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${authStore.tokens.accessToken}`,
      };
    }

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - just pass it through, don't auto-logout
      // Let the user handle authentication errors manually

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: 'An error occurred',
          error: 'NETWORK_ERROR'
        }));
        throw new Error(error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async login(credentials: LoginCredentials) {
    return this.request<{
      success: boolean;
      data: {
        user: User;
        tokens: AuthTokens;
        profile?: CustomerProfile;
        providerProfile?: ProviderProfile;
        redirectUrl?: string;
        requiresEmailVerification?: boolean;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async registerCustomer(data: RegisterCustomerData) {
    return this.request<{
      success: boolean;
      data: {
        user: User;
        tokens: AuthTokens;
        profile: CustomerProfile;
      };
    }>('/auth/register/customer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async registerProvider(data: RegisterProviderData, files?: FormData) {
    console.log('🔧 RegisterProvider called with data:', data);
    console.log('🔧 Files provided:', files ? 'Yes' : 'No');
    
    const formData = files || new FormData();
    
    // Properly serialize all the required fields for provider registration
    const fieldsToSerialize = [
      'firstName', 'lastName', 'email', 'password', 'phone', 'dateOfBirth',
      'agreeToTerms', 'agreeToPrivacy', 'agreeToBackground'
    ];
    
    fieldsToSerialize.forEach(field => {
      if (data[field as keyof RegisterProviderData] !== undefined) {
        formData.append(field, String(data[field as keyof RegisterProviderData]));
      }
    });
    
    // Handle nested objects properly
    if (data.businessInfo) {
      formData.append('businessInfo', JSON.stringify(data.businessInfo));
    }
    
    if (data.locationInfo) {
      formData.append('locationInfo', JSON.stringify(data.locationInfo));
    }
    
    if (data.services) {
      formData.append('services', JSON.stringify(data.services));
    }
    
    console.log('🔧 FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${typeof value === 'object' ? '[File]' : value}`);
    }

    return this.request<{
      success: boolean;
      data: {
        user: User;
        tokens: AuthTokens;
        profile: ProviderProfile;
      };
    }>('/auth/register/provider', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async getCurrentUser() {
    return this.request<{
      success: boolean;
      data: {
        user: User;
        profile?: CustomerProfile | ProviderProfile;
      };
    }>('/auth/me');
  }

  async updateProfile(data: Partial<User>, files?: FormData) {
    if (files) {
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          files.append(key, JSON.stringify(value));
        } else {
          files.append(key, String(value));
        }
      });

      return this.request<{
        success: boolean;
        data: {
          user: User;
          profile?: CustomerProfile | ProviderProfile;
        };
      }>('/auth/me', {
        method: 'PATCH',
        body: files,
        headers: {},
      });
    } else {
      return this.request<{
        success: boolean;
        data: {
          user: User;
          profile?: CustomerProfile | ProviderProfile;
        };
      }>('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    }
  }

  async logout() {
    return this.request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  }

  async logoutAll() {
    return this.request<{ success: boolean }>('/auth/logout-all', {
      method: 'POST',
    });
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.request<{ success: boolean }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });
  }

  async forgotPassword(email: string) {
    return this.request<{ success: boolean }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string, confirmPassword: string) {
    return this.request<{ success: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token,
        password,
        confirmPassword,
      }),
    });
  }

  async verifyEmail(token: string) {
    return this.request<{ success: boolean }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerification(email: string) {
    return this.request<{ success: boolean }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async refreshToken() {
    const authStore = useAuthStore.getState();
    if (!authStore.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.request<{
      success: boolean;
      data: {
        tokens: AuthTokens;
      };
    }>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken: authStore.tokens.refreshToken,
      }),
    });
  }
}

const authAPI = new AuthAPI();

// Authenticated fetch helper
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const authStore = useAuthStore.getState();

  if (!authStore.tokens?.accessToken) {
    throw new Error('No access token available');
  }

  // Ensure URL is absolute
  const baseURL = 'http://localhost:5000';
  const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;

  // Add authorization header
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${authStore.tokens.accessToken}`,
    },
  };

  return await fetch(fullUrl, config);
};

// Create the Zustand store
export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      user: null,
      customerProfile: null,
      providerProfile: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      errors: [],

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          set((state) => {
            state.isLoading = true;
            state.errors = [];
          });

          const response = await authAPI.login(credentials);
          
          set((state) => {
            state.user = response.data.user;
            state.tokens = {
              accessToken: response.data.tokens?.accessToken || (response.data as any).accessToken,
              refreshToken: response.data.tokens?.refreshToken || (response.data as any).refreshToken,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            };
            state.isAuthenticated = true;
            state.isLoading = false;

            if (response.data.user.role === 'customer' && response.data.profile) {
              state.customerProfile = response.data.profile as CustomerProfile;
            } else if (response.data.user.role === 'provider' && (response.data as any).providerProfile) {
              state.providerProfile = (response.data as any).providerProfile as ProviderProfile;
            }
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.errors = [{
              message: error instanceof Error ? error.message : 'Login failed',
              code: 'LOGIN_ERROR'
            }];
          });
          throw error;
        }
      },

      registerCustomer: async (data: RegisterCustomerData) => {
        try {
          set((state) => {
            state.isLoading = true;
            state.errors = [];
          });

          const response = await authAPI.registerCustomer(data);
          
          set((state) => {
            state.user = response.data.user;
            state.customerProfile = response.data.profile;
            state.tokens = {
              accessToken: response.data.tokens?.accessToken || (response.data as any).accessToken,
              refreshToken: response.data.tokens?.refreshToken || (response.data as any).refreshToken,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            };
            state.isAuthenticated = true;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.errors = [{
              message: error instanceof Error ? error.message : 'Registration failed',
              code: 'REGISTER_ERROR'
            }];
          });
          throw error;
        }
      },

      registerProvider: async (data: RegisterProviderData, files?: FormData) => {
        try {
          console.log('🏪 AuthStore: Starting provider registration');
          set((state) => {
            state.isLoading = true;
            state.errors = [];
          });

          console.log('🌐 AuthStore: Making API call');
          const response = await authAPI.registerProvider(data, files);
          console.log('✅ AuthStore: API call successful', response);
          
          set((state) => {
            state.user = response.data.user;
            state.providerProfile = response.data.profile;
            state.tokens = {
              accessToken: response.data.tokens?.accessToken || (response.data as any).accessToken,
              refreshToken: response.data.tokens?.refreshToken || (response.data as any).refreshToken,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            };
            state.isAuthenticated = true;
            state.isLoading = false;
          });
          console.log('💾 AuthStore: State updated successfully');
        } catch (error) {
          console.error('💥 AuthStore: Registration failed:', error);
          set((state) => {
            state.isLoading = false;
            state.errors = [{
              message: error instanceof Error ? error.message : 'Registration failed',
              code: 'REGISTER_ERROR'
            }];
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Call logout API before clearing tokens
          await authAPI.logout();
        } catch (error) {
          // Log error but don't prevent local logout
          console.error('Server logout failed:', error);
        } finally {
          // Always clear local state
          set((state) => {
            state.user = null;
            state.customerProfile = null;
            state.providerProfile = null;
            state.tokens = null;
            state.isAuthenticated = false;
            state.errors = [];
          });
        }
      },

      logoutAll: async () => {
        try {
          await authAPI.logoutAll();
        } catch (error) {
          console.error('Logout all failed:', error);
        } finally {
          set((state) => {
            state.user = null;
            state.customerProfile = null;
            state.providerProfile = null;
            state.tokens = null;
            state.isAuthenticated = false;
            state.errors = [];
          });
        }
      },

      getCurrentUser: async () => {
        try {
          set((state) => {
            state.isLoading = true;
          });

          const response = await authAPI.getCurrentUser();
          
          set((state) => {
            state.user = response.data.user;
            state.isLoading = false;
            
            if (response.data.user.role === 'customer' && response.data.profile) {
              state.customerProfile = response.data.profile as CustomerProfile;
            } else if (response.data.user.role === 'provider' && (response.data as any).providerProfile) {
              state.providerProfile = (response.data as any).providerProfile as ProviderProfile;
            }
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.errors = [{
              message: error instanceof Error ? error.message : 'Failed to get user data',
              code: 'GET_USER_ERROR'
            }];
          });
          throw error;
        }
      },

      updateProfile: async (data: Partial<User>, files?: FormData) => {
        try {
          set((state) => {
            state.isLoading = true;
            state.errors = [];
          });

          const response = await authAPI.updateProfile(data, files);
          
          set((state) => {
            state.user = response.data.user;
            state.isLoading = false;
            
            if (response.data.user.role === 'customer' && response.data.profile) {
              state.customerProfile = response.data.profile as CustomerProfile;
            } else if (response.data.user.role === 'provider' && (response.data as any).providerProfile) {
              state.providerProfile = (response.data as any).providerProfile as ProviderProfile;
            }
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.errors = [{
              message: error instanceof Error ? error.message : 'Profile update failed',
              code: 'UPDATE_PROFILE_ERROR'
            }];
          });
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          set((state) => {
            state.isLoading = true;
            state.errors = [];
          });

          await authAPI.changePassword(currentPassword, newPassword, newPassword);
          
          set((state) => {
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.errors = [{
              message: error instanceof Error ? error.message : 'Password change failed',
              code: 'CHANGE_PASSWORD_ERROR'
            }];
          });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        try {
          set((state) => {
            state.isLoading = true;
            state.errors = [];
          });

          await authAPI.forgotPassword(email);
          
          set((state) => {
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.errors = [{
              message: error instanceof Error ? error.message : 'Forgot password request failed',
              code: 'FORGOT_PASSWORD_ERROR'
            }];
          });
          throw error;
        }
      },

      resetPassword: async (token: string, password: string, confirmPassword: string) => {
        try {
          set((state) => {
            state.isLoading = true;
            state.errors = [];
          });

          await authAPI.resetPassword(token, password, confirmPassword);
          
          set((state) => {
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.errors = [{
              message: error instanceof Error ? error.message : 'Password reset failed',
              code: 'RESET_PASSWORD_ERROR'
            }];
          });
          throw error;
        }
      },

      verifyEmail: async (token: string) => {
        try {
          set((state) => {
            state.isLoading = true;
            state.errors = [];
          });

          await authAPI.verifyEmail(token);
          
          set((state) => {
            state.isLoading = false;
            if (state.user) {
              state.user.isEmailVerified = true;
            }
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.errors = [{
              message: error instanceof Error ? error.message : 'Email verification failed',
              code: 'EMAIL_VERIFICATION_ERROR'
            }];
          });
          throw error;
        }
      },

      resendVerification: async (email: string) => {
        try {
          set((state) => {
            state.isLoading = true;
            state.errors = [];
          });

          await authAPI.resendVerification(email);
          
          set((state) => {
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoading = false;
            state.errors = [{
              message: error instanceof Error ? error.message : 'Resend verification failed',
              code: 'RESEND_VERIFICATION_ERROR'
            }];
          });
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const response = await authAPI.refreshToken();
          
          set((state) => {
            state.tokens = {
              accessToken: response.data.tokens?.accessToken || response.data.accessToken,
              refreshToken: response.data.tokens?.refreshToken || response.data.refreshToken || state.tokens?.refreshToken || '',
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            };
          });
        } catch (error) {
          // Don't auto-logout on refresh failure, just throw error
          throw error;
        }
      },

      clearErrors: () => {
        set((state) => {
          state.errors = [];
        });
      },

      setError: (error: AuthError) => {
        set((state) => {
          state.errors = [error];
        });
      },

      setLoading: (loading: boolean) => {
        set((state) => {
          state.isLoading = loading;
        });
      },

      initialize: async () => {
        const tokens = get().tokens;

        if (tokens?.accessToken) {
          try {
            await get().getCurrentUser();
            set((state) => {
              state.isAuthenticated = true;
            });
          } catch (error) {
            console.error('Failed to initialize auth:', error);
            // Don't auto-logout, just continue
          }
        }

        set((state) => {
          state.isInitialized = true;
        });
      },
    })),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        customerProfile: state.customerProfile,
        providerProfile: state.providerProfile,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Auto-initialize on store creation
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize();
}