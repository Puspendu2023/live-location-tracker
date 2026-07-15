import Joi from 'joi';
import logger from '../config/logger.js';

/**
 * Generic validation middleware factory
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      logger.warn('Validation error:', errors);

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    req.body = value;
    next();
  };
};

/**
 * Validation Schemas
 */
export const schemas = {
  // Auth
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Profile
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    avatar: Joi.string().uri().optional(),
    emergencyContact: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    preferences: Joi.object().optional(),
  }),

  // Location
  updateLocation: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    accuracy: Joi.number().min(0).optional(),
    altitude: Joi.number().optional(),
    altitudeAccuracy: Joi.number().min(0).optional(),
    heading: Joi.number().min(0).max(360).optional(),
    speed: Joi.number().min(0).optional(),
    batteryLevel: Joi.number().min(0).max(100).optional(),
    networkStatus: Joi.string().optional(),
    deviceInfo: Joi.object().optional(),
  }),

  // Geofence
  createGeofence: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    type: Joi.string().valid('CIRCULAR', 'POLYGON').required(),
    centerLat: Joi.number().min(-90).max(90).when('type', {
      is: 'CIRCULAR',
      then: Joi.required(),
    }),
    centerLng: Joi.number().min(-180).max(180).when('type', {
      is: 'CIRCULAR',
      then: Joi.required(),
    }),
    radius: Joi.number().min(10).max(100000).when('type', {
      is: 'CIRCULAR',
      then: Joi.required(),
    }),
    coordinates: Joi.array().when('type', {
      is: 'POLYGON',
      then: Joi.required(),
    }),
    notifyEntry: Joi.boolean().optional(),
    notifyExit: Joi.boolean().optional(),
  }),

  // Chat
  sendMessage: Joi.object({
    receiverId: Joi.string().uuid().required(),
    message: Joi.string().min(1).max(1000).required(),
  }),
};