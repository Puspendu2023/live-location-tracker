import prisma from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Create geofence
 */
export const createGeofence = async (req, res) => {
  try {
    const geofence = await prisma.geofence.create({
      data: {
        ...req.body,
        userId: req.user.id,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'GEOFENCE_CREATED',
        details: { geofenceId: geofence.id, name: geofence.name },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    logger.info(`Geofence created: ${geofence.name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Geofence created successfully.',
      data: { geofence },
    });
  } catch (error) {
    logger.error('Create geofence error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create geofence.',
    });
  }
};

/**
 * Get all user geofences
 */
export const getGeofences = async (req, res) => {
  try {
    const geofences = await prisma.geofence.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { geofences },
    });
  } catch (error) {
    logger.error('Get geofences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch geofences.',
    });
  }
};

/**
 * Update geofence
 */
export const updateGeofence = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const existing = await prisma.geofence.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Geofence not found.',
      });
    }

    const geofence = await prisma.geofence.update({
      where: { id },
      data: req.body,
    });

    logger.info(`Geofence updated: ${geofence.name} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Geofence updated successfully.',
      data: { geofence },
    });
  } catch (error) {
    logger.error('Update geofence error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update geofence.',
    });
  }
};

/**
 * Delete geofence
 */
export const deleteGeofence = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const existing = await prisma.geofence.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Geofence not found.',
      });
    }

    await prisma.geofence.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'GEOFENCE_DELETED',
        details: { geofenceId: id, name: existing.name },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    logger.info(`Geofence deleted: ${existing.name} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Geofence deleted successfully.',
    });
  } catch (error) {
    logger.error('Delete geofence error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete geofence.',
    });
  }
};