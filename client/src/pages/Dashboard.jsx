import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMapPin, 
  FiUsers, 
  FiActivity, 
  FiNavigation, 
  FiClock,
  FiTrendingUp,
  FiAlertCircle,
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useLocationStore } from '../store/locationStore';
import { useSocketStore } from '../store/socketStore';
import LiveMapComponent from '../components/Map/LiveMap';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { currentLocation, isTracking } = useLocationStore();
  const { connected, liveLocations } = useSocketStore();
  const [stats, setStats] = useState({
    totalDistance: 0,
    averageSpeed: 0,
    duration: 0,
  });

  useEffect(() => {
    fetchTodayStats();
  }, []);

  const fetchTodayStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const response = await axios.get('/location/history', {
        params: {
          startDate: today.toISOString(),
          limit: 1000,
        },
      });

      setStats(response.data.data.stats || {});
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Current Status',
      value: isTracking ? 'Tracking' : 'Stopped',
      icon: FiActivity,
      color: isTracking ? 'green' : 'red',
      subtext: connected ? 'Connected' : 'Disconnected',
    },
    {
      title: 'Online Users',
      value: liveLocations.size,
      icon: FiUsers,
      color: 'blue',
      subtext: 'Active now',
    },
    {
      title: 'Distance Today',
      value: `${(stats.totalDistance / 1000).toFixed(2)} km`,
      icon: FiNavigation,
      color: 'purple',
      subtext: 'Total traveled',
    },
    {
      title: 'Average Speed',
      value: `${(stats.averageSpeed * 3.6).toFixed(1)} km/h`,
      icon: FiTrendingUp,
      color: 'orange',
      subtext: 'Current session',
    },
  ];

  const locationArray = Array.from(liveLocations.values());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your location tracking overview
        </p>
      </div>

      {/* Warning if not tracking */}
      {!isTracking && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border-l-4 border-yellow-500 p-4 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <FiAlertCircle className="text-yellow-500" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Location Tracking is Off
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enable tracking from the sidebar to start monitoring your location
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            green: 'bg-green-100 dark:bg-green-900/20 text-green-600',
            red: 'bg-red-100 dark:bg-red-900/20 text-red-600',
            blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
            purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
            orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600',
          };

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-xl hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {stat.subtext}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Live Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass p-6 rounded-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Live Location Map
          </h2>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
        <LiveMapComponent
          currentLocation={currentLocation}
          locations={locationArray}
          height="500px"
        />
      </motion.div>

      {/* Current Location Details */}
      {currentLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass p-6 rounded-xl"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Current Location Details
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Latitude</p>
              <p className="font-mono text-lg font-semibold">
                {currentLocation.latitude.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Longitude</p>
              <p className="font-mono text-lg font-semibold">
                {currentLocation.longitude.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Accuracy</p>
              <p className="font-mono text-lg font-semibold">
                ±{Math.round(currentLocation.accuracy)}m
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Speed</p>
              <p className="font-mono text-lg font-semibold">
                {currentLocation.speed !== null 
                  ? `${(currentLocation.speed * 3.6).toFixed(1)} km/h`
                  : 'N/A'}
              </p>
            </div>
            {currentLocation.altitude && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Altitude</p>
                <p className="font-mono text-lg font-semibold">
                  {Math.round(currentLocation.altitude)}m
                </p>
              </div>
            )}
            {currentLocation.heading !== null && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Heading</p>
                <p className="font-mono text-lg font-semibold">
                  {Math.round(currentLocation.heading)}°
                </p>
              </div>
            )}
            {currentLocation.batteryLevel && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Battery</p>
                <p className="font-mono text-lg font-semibold">
                  {currentLocation.batteryLevel}%
                </p>
              </div>
            )}
            {currentLocation.networkStatus && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Network</p>
                <p className="font-mono text-lg font-semibold uppercase">
                  {currentLocation.networkStatus}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Online Users */}
      {locationArray.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass p-6 rounded-xl"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Online Users ({locationArray.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locationArray.map((item, index) => (
              <div
                key={item.user.id}
                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                  {item.user.avatar ? (
                    <img
                      src={item.user.avatar}
                      alt={item.user.name}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <span className="text-primary-600 font-semibold">
                      {item.user.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.user.email}
                  </p>
                  {item.location.speed && item.location.speed > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {(item.location.speed * 3.6).toFixed(1)} km/h
                    </p>
                  )}
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;