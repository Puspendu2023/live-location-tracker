import prisma from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { search, status, role, limit = 50, offset = 0 } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          isBlocked: true,
          lastSeen: true,
          createdAt: true,
          _count: {
            select: {
              locations: true,
              sessions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + parseInt(limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
    });
  }
};

/**
 * Block/Unblock user
 */
export const toggleBlockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Cannot block admin users.',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: !user.isBlocked },
      select: {
        id: true,
        email: true,
        name: true,
        isBlocked: true,
      },
    });

    // Invalidate all sessions if blocking
    if (updatedUser.isBlocked) {
      await prisma.session.deleteMany({
        where: { userId },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { status: 'OFFLINE' },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: updatedUser.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
        details: { targetUserId: userId, targetEmail: user.email },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    logger.info(`User ${updatedUser.isBlocked ? 'blocked' : 'unblocked'}: ${user.email}`);

    res.json({
      success: true,
      message: `User ${updatedUser.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
      data: { user: updatedUser },
    });
  } catch (error) {
    logger.error('Toggle block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status.',
    });
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users.',
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'USER_DELETED',
        details: { targetUserId: userId, targetEmail: user.email },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    logger.info(`User deleted: ${user.email}`);

    res.json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user.',
    });
  }
};

/**
 * Get analytics
 */
export const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      todayLocations,
      totalLocations,
      usersByRole,
      usersByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ONLINE' } }),
      prisma.location.count({
        where: {
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.location.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      prisma.user.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    // Get registration trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const registrationTrend = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      _count: true,
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          todayLocations,
          totalLocations,
        },
        usersByRole,
        usersByStatus,
        registrationTrend,
      },
    });
  } catch (error) {
    logger.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics.',
    });
  }
};

/**
 * Get activity logs
 */
export const getActivityLogs = async (req, res) => {
  try {
    const { userId, action, limit = 100, offset = 0 } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + parseInt(limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs.',
    });
  }
};