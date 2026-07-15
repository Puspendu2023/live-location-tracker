import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import logger from '../config/logger.js';

let io;

// Store active connections
const activeConnections = new Map();

/**
 * Initialize Socket.IO
 */
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user and session
      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!session || new Date() > session.expiresAt || session.user.isBlocked) {
        return next(new Error('Authentication error'));
      }

      socket.userId = session.user.id;
      socket.userData = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.avatar,
        role: session.user.role,
      };

      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', async (socket) => {
    logger.info(`Socket connected: ${socket.userId}`);

    // Store connection
    activeConnections.set(socket.userId, socket.id);

    // Update user status
    await prisma.user.update({
      where: { id: socket.userId },
      data: { 
        status: 'ONLINE',
        lastSeen: new Date(),
      },
    });

    // Notify others
    socket.broadcast.emit('user:online', socket.userData);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Location update handler
    socket.on('location:update', async (locationData) => {
      try {
        // Validate location data
        if (!locationData.latitude || !locationData.longitude) {
          socket.emit('error', { message: 'Invalid location data' });
          return;
        }

        // Save to database
        const location = await prisma.location.create({
          data: {
            userId: socket.userId,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
            altitude: locationData.altitude,
            altitudeAccuracy: locationData.altitudeAccuracy,
            heading: locationData.heading,
            speed: locationData.speed,
            batteryLevel: locationData.batteryLevel,
            networkStatus: locationData.networkStatus,
            deviceInfo: locationData.deviceInfo,
          },
        });

        // Update last seen
        await prisma.user.update({
          where: { id: socket.userId },
          data: { lastSeen: new Date() },
        });

        // Broadcast to all connected clients
        io.emit('location:broadcast', {
          user: socket.userData,
          location: {
            id: location.id,
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            altitude: location.altitude,
            heading: location.heading,
            speed: location.speed,
            timestamp: location.timestamp,
          },
        });

        // Check for geofence violations
        checkGeofencesRealtime(socket.userId, locationData.latitude, locationData.longitude);

      } catch (error) {
        logger.error('Location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Chat message handler
    socket.on('chat:send', async (data) => {
      try {
        const { receiverId, message } = data;

        // Save message
        const chatMessage = await prisma.chatMessage.create({
          data: {
            senderId: socket.userId,
            receiverId,
            message,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        });

        // Send to receiver if online
        const receiverSocketId = activeConnections.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('chat:receive', chatMessage);
        }

        // Confirm to sender
        socket.emit('chat:sent', chatMessage);

        // Create notification for receiver
        await prisma.notification.create({
          data: {
            userId: receiverId,
            type: 'USER_ONLINE',
            title: 'New Message',
            message: `${socket.userData.name} sent you a message`,
            data: { chatMessageId: chatMessage.id },
          },
        });

      } catch (error) {
        logger.error('Chat send error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // SOS alert handler
    socket.on('sos:trigger', async (data) => {
      try {
        const { latitude, longitude, message } = data;

        // Create notification
        const notification = await prisma.notification.create({
          data: {
            userId: socket.userId,
            type: 'SOS_ALERT',
            title: 'SOS Alert',
            message: message || 'Emergency alert triggered',
            data: { latitude, longitude },
          },
        });

        // Notify emergency contact if set
        const user = await prisma.user.findUnique({
          where: { id: socket.userId },
        });

        if (user.emergencyContact) {
          // In production, send SMS/Email here
          logger.info(`SOS alert for ${user.email}, contact: ${user.emergencyContact}`);
        }

        // Notify all admins
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true },
        });

        admins.forEach(admin => {
          const adminSocketId = activeConnections.get(admin.id);
          if (adminSocketId) {
            io.to(adminSocketId).emit('sos:alert', {
              user: socket.userData,
              location: { latitude, longitude },
              message,
              timestamp: new Date(),
            });
          }
        });

        socket.emit('sos:confirmed', notification);

      } catch (error) {
        logger.error('SOS trigger error:', error);
        socket.emit('error', { message: 'Failed to trigger SOS' });
      }
    });

    // Disconnect handler
    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.userId}`);

      // Remove from active connections
      activeConnections.delete(socket.userId);

      // Update user status
      await prisma.user.update({
        where: { id: socket.userId },
        data: { 
          status: 'OFFLINE',
          lastSeen: new Date(),
        },
      });

      // Notify others
      socket.broadcast.emit('user:offline', socket.userData);
    });
  });

  logger.info('✅ Socket.IO initialized');

  return io;
};

/**
 * Get Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Send notification to specific user
 */
export const sendNotificationToUser = (userId, event, data) => {
  const socketId = activeConnections.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
};

/**
 * Broadcast to all connected users
 */
export const broadcastToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

/**
 * Check geofences in real-time
 */
async function checkGeofencesRealtime(userId, latitude, longitude) {
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
      }

      // Get previous location
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
        }

        // Entry/Exit detection and notification
        if (isInside && !wasInside && geofence.notifyEntry) {
          const notification = await prisma.notification.create({
            data: {
              userId,
              type: 'GEOFENCE_ENTRY',
              title: 'Geofence Entry',
              message: `You entered ${geofence.name}`,
              data: { geofenceId: geofence.id },
            },
          });

          sendNotificationToUser(userId, 'notification:new', notification);
        } else if (!isInside && wasInside && geofence.notifyExit) {
          const notification = await prisma.notification.create({
            data: {
              userId,
              type: 'GEOFENCE_EXIT',
              title: 'Geofence Exit',
              message: `You left ${geofence.name}`,
              data: { geofenceId: geofence.id },
            },
          });

          sendNotificationToUser(userId, 'notification:new', notification);
        }
      }
    }
  } catch (error) {
    logger.error('Realtime geofence check error:', error);
  }
}

/**
 * Calculate distance (Haversine)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
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