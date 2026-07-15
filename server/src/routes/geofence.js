import express from 'express';
import {
  createGeofence,
  getGeofences,
  updateGeofence,
  deleteGeofence,
} from '../controllers/geofenceController.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.post('/', validate(schemas.createGeofence), createGeofence);
router.get('/', getGeofences);
router.put('/:id', updateGeofence);
router.delete('/:id', deleteGeofence);

export default router;