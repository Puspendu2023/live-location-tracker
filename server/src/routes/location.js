import express from 'express';
import {
  updateLocation,
  getCurrentLocation,
  getLocationHistory,
  deleteLocationHistory,
  getAllUsersLocations,
} from '../controllers/locationController.js';
import { isAdmin } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { locationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/update', locationLimiter, validate(schemas.updateLocation), updateLocation);
router.get('/current/:userId?', getCurrentLocation);
router.get('/history/:userId?', getLocationHistory);
router.delete('/history', deleteLocationHistory);
router.get('/users/all', isAdmin, getAllUsersLocations);

export default router;