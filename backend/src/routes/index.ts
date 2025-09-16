import { Router } from 'express';
import verifyRoutes from './verify.routes';
import authRoutes from './auth.routes';
import searchRoutes from './search.routes';
import adminRoutes from './admin.routes';
import providerRoutes from './provider.routes';

const router = Router();

// API Welcome route
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Home Service Marketplace API',
    version: process.env.API_VERSION || 'v1',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      test: '/api/test',
      auth: '/api/auth',
      verify: '/api/verify',
      search: '/api/search',
      admin: '/api/admin',
      provider: '/api/provider',
      documentation: '/api-docs'
    }
  });
});

// Authentication routes
router.use('/auth', authRoutes);

// Verification routes
router.use('/verify', verifyRoutes);

// Search routes
router.use('/search', searchRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Provider routes
router.use('/provider', providerRoutes);

// Future route imports will go here
// router.use('/users', userRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/payments', paymentRoutes);

export default router;