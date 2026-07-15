import prisma from '../config/database.js';
import logger from '../config/logger.js';
import axios from 'axios';

/**
 * Update user location
 */
export const updateLocation = async (req, res) => {
  try {
    const locationData = {
      ...req.body,
      userId: req.user.id,
    };

    // Get address via reverse geocoding (optional)
    if (process.env.OPENCAGE_API_KEY) {
      try {
        const { latitude, longitude } = req.body;
        const response = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.OPENCAGE_API_KEY}`
        );
        
        if (response.data.results.length > 0) {
          locationData.address = response.data.results[0].formatted;
        }
      } catch (error) {
        logger.warn('Reverse geocoding failed:', error.message);
      }
    }

    const location = await prisma.location.create({
      data: locationData,
    });

    // Update user's last seen
    await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        status: 'ONLINE',
        lastSeen: new Date(),
      },
    });

    // Check geofences
    await checkGeofences(req.user.id, req.body.latitude, req.body.longitude);

    res.json({
      success: true,
      message: 'Location updated successfully.',
      data: { location },
    });
  } catch (error) {
    logger.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location.',
    });
  }
};

/**
 * Get current location
 */
export const getCurrentLocation = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    const location = await prisma.location.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            status: true,
          },
        },
      },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'No location found.',
      });
    }

    res.json({
      success: true,
      data: { location },
    });
  } catch (error) {
    logger.error('Get current location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location.',
    });
  }
};

/**
 * Get location history
 */
export const getLocationHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { startDate, endDate, limit = 100, offset = 0 } = req.query;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    const where = { userId };

    // Date filtering
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.location.count({ where }),
    ]);

    // Calculate statistics
    const stats = await calculateTravelStats(userId, startDate, endDate);

    res.json({
      success: true,
      data: {
        locations,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + parseInt(limit),
        },
        stats,
      },
    });
  } catch (error) {
    logger.error('Get location history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location history.',
    });
  }
};

/**
 * Delete location history
 */
export const deleteLocationHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const where = { userId: req.user.id };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const result = await prisma.location.deleteMany({ where });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'LOCATION_HISTORY_DELETED',
        details: { count: result.count, startDate, endDate },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    logger.info(`Location history deleted: ${req.user.email} (${result.count} records)`);

    res.json({
      success: true,
      message: `${result.count} location records deleted.`,
      data: { count: result.count },
    });
  } catch (error) {
    logger.error('Delete location history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete location history.',
    });
  }
};

/**
 * Get all users with latest location (Admin only)
 */
export const getAllUsersLocations = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
        lastSeen: true,
        locations: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    const usersWithLocation = users
      .filter(user => user.locations.length > 0)
      .map(user => ({
        ...user,
        currentLocation: user.locations[0],
        locations: undefined,
      }));

    res.json({
      success: true,
      data: { users: usersWithLocation },
    });
  } catch (error) {
    logger.error('Get all users locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users locations.',
    });
  }
};

/**
 * Helper: Calculate travel statistics
 */
async function calculateTravelStats(userId, startDate, endDate) {
  const where = { userId };
  
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);
  }

  const locations = await prisma.location.findMany({
    where,
    orderBy: { timestamp: 'asc' },
    select: {
      latitude: true,
      longitude: true,
      speed: true,
      timestamp: true,
    },
  });

  if (locations.length < 2) {
    return {
      totalDistance: 0,
      averageSpeed: 0,
      maxSpeed: 0,
      duration: 0,
    };
  }

  let totalDistance = 0;
  let maxSpeed = 0;
  const speeds = [];

  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];

    // Calculate distance using Haversine formula
    const distance = calculateDistance(
      prev.latitude,
      prev.longitude,
      curr.latitude,
      curr.longitude
    );

    totalDistance += distance;

    if (curr.speed) {
      speeds.push(curr.speed);
      maxSpeed = Math.max(maxSpeed, curr.speed);
    }
  }

  const averageSpeed = speeds.length > 0
    ? speeds.reduce((a, b) => a + b, 0) / speeds.length
    : 0;

  const duration = locations[locations.length - 1].timestamp - locations[0].timestamp;

  return {
    totalDistance: Math.round(totalDistance), // meters
    averageSpeed: Math.round(averageSpeed * 100) / 100, // m/s
    maxSpeed: Math.round(maxSpeed * 100) / 100, // m/s
    duration: Math.round(duration / 1000), // seconds
  };
}

/**
 * Helper: Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Helper: Check geofences
 */
async function checkGeofences(userId, latitude, longitude) {
  try {
    const geofences = await prisma.geofence.findMany({
      where: { userId, isActive: true },
    });

    for (const geofence of geofences) {
      let isInside = false;

      if (geofence.type === 'CIRCULAR') {
        const distance = calculateDistance(
          latitude,
          longitude,
          geofence.centerLat,
          geofence.centerLng
        );
        isInside = distance <= geofence.radius;
      } else if (geofence.type === 'POLYGON') {
        isInside = isPointInPolygon(
          latitude,
          longitude,
          geofence.coordinates
        );
      }

      // Get previous location to detect entry/exit
      const prevLocation = await prisma.location.findFirst({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        skip: 1,
      });

      if (prevLocation) {
        let wasInside = false;

        if (geofence.type === 'CIRCULAR') {
          const prevDistance = calculateDistance(
            prevLocation.latitude,
            prevLocation.longitude,
            geofence.centerLat,
            geofence.centerLng
          );
          wasInside = prevDistance <= geofence.radius;
        } else if (geofence.type === 'POLYGON') {
          wasInside = isPointInPolygon(
            prevLocation.latitude,
            prevLocation.longitude,
            geofence.coordinates
          );
        }

        // Entry detection
        if (isInside && !wasInside && geofence.notifyEntry) {
          await prisma.notification.create({
            data: {
              userId,
              type: 'GEOFENCE_ENTRY',
              title: 'Geofence Entry',
              message: `You entered ${geofence.name}`,
              data: { geofenceId: geofence.id },
            },
          });
        }

        // Exit detection
        if (!isInside && wasInside && geofence.notifyExit) {
          await prisma.notification.create({
            data: {
              userId,
              type: 'GEOFENCE_EXIT',
              title: 'Geofence Exit',
              message: `You left ${geofence.name}`,
              data: { geofenceId: geofence.id },
            },
          });
        }
      }
    }
  } catch (error) {
    logger.error('Check geofences error:', error);
  }
}

/**
 * Helper: Point in polygon detection
 */
function isPointInPolygon(lat, lng, polygon) {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    
    const intersect = ((yi > lng) !== (yj > lng))
      && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}