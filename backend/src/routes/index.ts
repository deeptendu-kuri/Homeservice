import { Router } from 'express';
import verifyRoutes from './verify.routes';

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
      verify: '/api/verify',
      documentation: '/api-docs'
    }
  });
});

// Verification routes
router.use('/verify', verifyRoutes);

// Future route imports will go here
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/services', serviceRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/payments', paymentRoutes);

export default router;