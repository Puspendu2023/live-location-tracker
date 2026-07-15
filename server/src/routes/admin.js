import express from 'express';
import {
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  getAnalytics,
  getActivityLogs,
} from '../controllers/adminController.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin privileges
router.use(isAdmin);

router.get('/users', getAllUsers);
router.put('/users/:userId/block', toggleBlockUser);
router.delete('/users/:userId', deleteUser);
router.get('/analytics', getAnalytics);
router.get('/logs', getActivityLogs);

export default router;