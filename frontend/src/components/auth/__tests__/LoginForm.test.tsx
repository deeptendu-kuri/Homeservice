import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import LoginForm from '../LoginForm';
import { useAuthStore } from '../../../stores/authStore';

// Mock the auth store
jest.mock('../../../stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation()
}));

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  const mockClearErrors = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({ state: null });
    
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      clearErrors: mockClearErrors,
      isLoading: false,
      errors: [],
      user: null,
      isAuthenticated: false
    } as any);
  });

  const renderLoginForm = () => {
    return render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );
  };

  it('renders login form correctly', () => {
    renderLoginForm();

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderLoginForm();

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderLoginForm();

    const emailInput = screen.getByPlaceholderText('Email address');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    mockLogin.mockResolvedValue({
      success: true,
      redirectPath: '/customer/dashboard'
    });

    renderLoginForm();

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123!');
      expect(mockNavigate).toHaveBeenCalledWith('/customer/dashboard');
    });
  });

  it('handles login failure', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      error: 'Invalid credentials'
    });

    renderLoginForm();

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('displays loading state during submission', async () => {
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      clearErrors: mockClearErrors,
      isLoading: true,
      errors: [],
      user: null,
      isAuthenticated: false
    } as any);

    renderLoginForm();

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('displays error messages from store', () => {
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      clearErrors: mockClearErrors,
      isLoading: false,
      errors: ['Invalid email or password'],
      user: null,
      isAuthenticated: false
    } as any);

    renderLoginForm();

    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  it('displays success message from location state', () => {
    mockUseLocation.mockReturnValue({
      state: { message: 'Registration successful! Please sign in.' }
    });

    renderLoginForm();

    expect(screen.getByText('Registration successful! Please sign in.')).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    renderLoginForm();

    const passwordInput = screen.getByPlaceholderText('Password');
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('handles remember me checkbox', () => {
    renderLoginForm();

    const rememberMeCheckbox = screen.getByLabelText('Remember me');
    
    expect(rememberMeCheckbox).not.toBeChecked();
    
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();
  });

  it('navigates to forgot password page', () => {
    renderLoginForm();

    const forgotPasswordLink = screen.getByText('Forgot password?');
    fireEvent.click(forgotPasswordLink);

    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
  });

  it('navigates to registration pages', () => {
    renderLoginForm();

    const customerRegisterLink = screen.getByText('Sign up as Customer');
    fireEvent.click(customerRegisterLink);
    expect(mockNavigate).toHaveBeenCalledWith('/register/customer');

    const providerRegisterLink = screen.getByText('Sign up as Provider');
    fireEvent.click(providerRegisterLink);
    expect(mockNavigate).toHaveBeenCalledWith('/register/provider');
  });

  it('clears errors on mount', () => {
    renderLoginForm();
    expect(mockClearErrors).toHaveBeenCalled();
  });

  it('handles keyboard navigation', async () => {
    renderLoginForm();

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.keyDown(emailInput, { key: 'Tab' });
    expect(passwordInput).toHaveFocus();
  });
});