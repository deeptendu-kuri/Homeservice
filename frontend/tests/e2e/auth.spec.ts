import { test, expect, Page } from '@playwright/test';

// Test data
const testCustomer = {
  firstName: 'John',
  lastName: 'Doe', 
  email: 'test.customer@example.com',
  password: 'Password123!',
  phone: '1234567890'
};

const testProvider = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'test.provider@example.com', 
  password: 'Password123!',
  phone: '0987654321',
  businessName: 'Jane\'s Beauty Studio',
  businessDescription: 'Professional beauty services'
};

const testAdmin = {
  email: 'admin@homeservice.com',
  password: 'AdminPassword123!'
};

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await page.goto('/');
  });

  test.describe('Customer Registration', () => {
    test('should complete customer registration flow', async ({ page }) => {
      // Navigate to customer registration
      await page.click('text=Sign up as Customer');
      await expect(page).toHaveURL('/register/customer');

      // Fill registration form
      await page.fill('[data-testid="firstName"]', testCustomer.firstName);
      await page.fill('[data-testid="lastName"]', testCustomer.lastName);
      await page.fill('[data-testid="email"]', testCustomer.email);
      await page.fill('[data-testid="password"]', testCustomer.password);
      await page.fill('[data-testid="confirmPassword"]', testCustomer.password);
      await page.fill('[data-testid="phone"]', testCustomer.phone);

      // Accept terms
      await page.check('[data-testid="agreeToTerms"]');
      await page.check('[data-testid="agreeToPrivacy"]');

      // Submit form
      await page.click('[data-testid="submit-button"]');

      // Should redirect to dashboard or verification page
      await page.waitForURL(/\/(customer\/dashboard|verify-email-required)/, { timeout: 10000 });

      // Verify success
      const currentUrl = page.url();
      const isOnDashboard = currentUrl.includes('/customer/dashboard');
      const isOnVerification = currentUrl.includes('/verify-email-required');
      
      expect(isOnDashboard || isOnVerification).toBe(true);

      if (isOnDashboard) {
        await expect(page.locator('h1')).toContainText('Welcome back');
      } else {
        await expect(page.locator('h2')).toContainText('Email Verification Required');
      }
    });

    test('should show validation errors for invalid data', async ({ page }) => {
      await page.goto('/register/customer');

      // Submit empty form
      await page.click('[data-testid="submit-button"]');

      // Check for validation errors
      await expect(page.locator('text=First name is required')).toBeVisible();
      await expect(page.locator('text=Last name is required')).toBeVisible();
      await expect(page.locator('text=Invalid email address')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });

    test('should validate password strength', async ({ page }) => {
      await page.goto('/register/customer');

      const weakPasswords = ['123', 'password', 'Password', 'Password123'];
      
      for (const password of weakPasswords) {
        await page.fill('[data-testid="password"]', password);
        await page.fill('[data-testid="firstName"]', 'Test');
        await page.fill('[data-testid="lastName"]', 'User');
        await page.fill('[data-testid="email"]', 'test@example.com');
        await page.check('[data-testid="agreeToTerms"]');
        await page.check('[data-testid="agreeToPrivacy"]');
        
        await page.click('[data-testid="submit-button"]');
        
        // Should show password strength error
        await expect(page.locator('text=Password must contain')).toBeVisible();
        
        // Clear form for next iteration
        await page.fill('[data-testid="password"]', '');
      }
    });
  });

  test.describe('Provider Registration', () => {
    test('should complete provider multi-step registration', async ({ page }) => {
      await page.goto('/register/provider');

      // Step 1: Account Info
      await page.fill('[data-testid="firstName"]', testProvider.firstName);
      await page.fill('[data-testid="lastName"]', testProvider.lastName);
      await page.fill('[data-testid="email"]', testProvider.email);
      await page.fill('[data-testid="password"]', testProvider.password);
      await page.fill('[data-testid="confirmPassword"]', testProvider.password);
      await page.fill('[data-testid="phone"]', testProvider.phone);
      
      await page.click('[data-testid="next-button"]');

      // Step 2: Business Info
      await page.fill('[data-testid="businessName"]', testProvider.businessName);
      await page.selectOption('[data-testid="businessType"]', 'individual');
      await page.fill('[data-testid="businessDescription"]', testProvider.businessDescription);
      await page.fill('[data-testid="yearsOfExperience"]', '10');
      
      await page.click('[data-testid="next-button"]');

      // Step 3: Services (skip detailed implementation)
      await page.click('[data-testid="next-button"]');

      // Step 4: Location (skip detailed implementation)
      await page.click('[data-testid="next-button"]');

      // Step 5: Documents (skip file uploads)
      await page.click('[data-testid="next-button"]');

      // Step 6: Terms
      await page.check('[data-testid="agreeToProviderTerms"]');
      await page.check('[data-testid="agreeToCommissionStructure"]');
      await page.check('[data-testid="agreeToBackgroundCheck"]');
      
      await page.click('[data-testid="submit-button"]');

      // Should redirect to verification pending
      await page.waitForURL('/provider/verification-pending');
      await expect(page.locator('text=under review')).toBeVisible();
    });

    test('should show step progress indicator', async ({ page }) => {
      await page.goto('/register/provider');

      // Should show step 1 as active
      await expect(page.locator('[data-testid="step-1"]')).toHaveClass(/active/);
      
      // Fill step 1 and proceed
      await page.fill('[data-testid="firstName"]', 'Test');
      await page.fill('[data-testid="lastName"]', 'User');
      await page.fill('[data-testid="email"]', 'test@example.com');
      await page.fill('[data-testid="password"]', 'Password123!');
      await page.fill('[data-testid="confirmPassword"]', 'Password123!');
      await page.fill('[data-testid="phone"]', '1234567890');
      
      await page.click('[data-testid="next-button"]');
      
      // Should show step 2 as active
      await expect(page.locator('[data-testid="step-2"]')).toHaveClass(/active/);
      await expect(page.locator('[data-testid="step-1"]')).toHaveClass(/completed/);
    });
  });

  test.describe('Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      await page.goto('/login');

      // Fill login form
      await page.fill('[data-testid="email"]', testAdmin.email);
      await page.fill('[data-testid="password"]', testAdmin.password);

      // Submit login
      await page.click('[data-testid="login-button"]');

      // Should redirect to dashboard
      await page.waitForURL('/admin/dashboard');
      await expect(page.locator('h1')).toContainText('Admin Dashboard');
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login');

      // Submit empty form
      await page.click('[data-testid="login-button"]');

      // Check for validation errors
      await expect(page.locator('text=Invalid email address')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      // Fill with invalid credentials
      await page.fill('[data-testid="email"]', 'invalid@example.com');
      await page.fill('[data-testid="password"]', 'WrongPassword123!');
      await page.click('[data-testid="login-button"]');

      // Should show error message
      await expect(page.locator('text=Invalid email or password')).toBeVisible();
    });

    test('should toggle password visibility', async ({ page }) => {
      await page.goto('/login');

      const passwordInput = page.locator('[data-testid="password"]');
      const toggleButton = page.locator('[data-testid="toggle-password"]');

      await expect(passwordInput).toHaveAttribute('type', 'password');

      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');

      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // First login
      await loginAsAdmin(page);
      
      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');

      // Should redirect to home page
      await page.waitForURL('/');
      
      // Verify logged out state
      await expect(page.locator('text=Sign In')).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access protected route without login
      await page.goto('/customer/dashboard');

      // Should redirect to login
      await page.waitForURL('/login');
    });

    test('should prevent role-based access violations', async ({ page }) => {
      // Login as admin
      await loginAsAdmin(page);

      // Try to access customer dashboard
      await page.goto('/customer/dashboard');

      // Should redirect to appropriate dashboard or show error
      await expect(page).toHaveURL('/admin/dashboard');
    });
  });

  test.describe('Password Reset Flow', () => {
    test('should handle forgot password request', async ({ page }) => {
      await page.goto('/login');

      // Click forgot password link
      await page.click('text=Forgot password?');
      await expect(page).toHaveURL('/forgot-password');

      // Fill email
      await page.fill('[data-testid="email"]', testAdmin.email);
      await page.click('[data-testid="submit-button"]');

      // Should show success message
      await expect(page.locator('text=password reset email')).toBeVisible();
    });
  });

  test.describe('Email Verification', () => {
    test('should show email verification required page', async ({ page }) => {
      // This test assumes user registration redirects to verification page
      await page.goto('/verify-email-required');

      await expect(page.locator('h2')).toContainText('Email Verification Required');
      await expect(page.locator('text=verify your email')).toBeVisible();
    });

    test('should resend verification email', async ({ page }) => {
      await page.goto('/verify-email-required');

      await page.click('[data-testid="resend-button"]');

      // Should show success message
      await expect(page.locator('text=Verification email sent')).toBeVisible();
      
      // Button should be disabled with countdown
      await expect(page.locator('[data-testid="resend-button"]')).toBeDisabled();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/login');

      // Should display mobile-friendly layout
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
      
      // Fill and submit form
      await page.fill('[data-testid="email"]', testAdmin.email);
      await page.fill('[data-testid="password"]', testAdmin.password);
      await page.click('[data-testid="login-button"]');

      // Should work on mobile
      await page.waitForURL('/admin/dashboard');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/login');

      // Check for ARIA labels
      await expect(page.locator('[aria-label="Email address"]')).toBeVisible();
      await expect(page.locator('[aria-label="Password"]')).toBeVisible();
      await expect(page.locator('[role="button"]')).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/login');

      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="email"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="password"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="login-button"]')).toBeFocused();
    });
  });
});

// Helper functions
async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', testAdmin.email);
  await page.fill('[data-testid="password"]', testAdmin.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/admin/dashboard');
}

async function registerTestCustomer(page: Page) {
  await page.goto('/register/customer');
  await page.fill('[data-testid="firstName"]', testCustomer.firstName);
  await page.fill('[data-testid="lastName"]', testCustomer.lastName);
  await page.fill('[data-testid="email"]', testCustomer.email);
  await page.fill('[data-testid="password"]', testCustomer.password);
  await page.fill('[data-testid="confirmPassword"]', testCustomer.password);
  await page.fill('[data-testid="phone"]', testCustomer.phone);
  await page.check('[data-testid="agreeToTerms"]');
  await page.check('[data-testid="agreeToPrivacy"]');
  await page.click('[data-testid="submit-button"]');
  await page.waitForNavigation();
}