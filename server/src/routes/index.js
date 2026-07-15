import express from 'express';
import authRoutes from './auth.js';
import locationRoutes from './location.js';
import geofenceRoutes from './geofence.js';
import notificationRoutes from './notification.js';
import adminRoutes from './admin.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/location', authenticate, locationRoutes);
router.use('/geofence', authenticate, geofenceRoutes);
router.use('/notification', authenticate, notificationRoutes);
router.use('/admin', authenticate, adminRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;