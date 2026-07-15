import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMaximize, 
  FiMinimize, 
  FiTarget, 
  FiUsers,
  FiFilter,
  FiRefreshCw,
} from 'react-icons/fi';
import LiveMapComponent from '../components/Map/LiveMap';
import { useLocationStore } from '../store/locationStore';
import { useSocketStore } from '../store/socketStore';
import axios from 'axios';
import toast from 'react-hot-toast';

const LiveMap = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const { currentLocation } = useLocationStore();
  const { liveLocations, connected } = useSocketStore();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('/location/users/all');
      setAllUsers(response.data.data.users);
      // Select all users by default
      setSelectedUsers(new Set(response.data.data.users.map(u => u.id)));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  // Filter locations based on selected users
  const filteredLocations = Array.from(liveLocations.values()).filter(
    item => selectedUsers.has(item.user.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Live Map 🗺️
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time location tracking of all users
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllUsers}
            className="px-4 py-2 glass rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
          >
            <FiRefreshCw size={18} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 glass rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
          >
            <FiFilter size={18} />
            <span className="hidden sm:inline">Filter</span>
            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
              {selectedUsers.size}
            </span>
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass p-4 rounded-lg border-l-4 ${
          connected ? 'border-green-500' : 'border-red-500'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="font-semibold text-gray-900 dark:text-white">
              {connected ? 'Live Tracking Active' : 'Connection Lost'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <FiUsers size={16} />
              {liveLocations.size} online
            </span>
            <span className="flex items-center gap-2">
              <FiTarget size={16} />
              {filteredLocations.length} visible
            </span>
          </div>
        </div>
      </motion.div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass p-6 rounded-xl"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Filter Users
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto custom-scrollbar">
            {allUsers.map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.id)}
                  onChange={() => toggleUserSelection(user.id)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <span className="text-primary-600 font-semibold text-sm">
                        {user.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </motion.div>
      )}

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-4 rounded-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Live Tracking
          </h2>
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
            <span className="hidden sm:inline">
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </span>
          </button>
        </div>
        
        <LiveMapComponent
          currentLocation={currentLocation}
          locations={filteredLocations}
          height={isFullscreen ? '100vh' : '600px'}
        />
      </motion.div>

      {/* Location Cards */}
      {filteredLocations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-xl"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Active Users ({filteredLocations.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map((item) => (
              <div
                key={item.user.id}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
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
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {item.user.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {item.user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Online
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Latitude:</span>
                    <span className="font-mono font-semibold">
                      {item.location.latitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Longitude:</span>
                    <span className="font-mono font-semibold">
                      {item.location.longitude.toFixed(6)}
                    </span>
                  </div>
                  {item.location.accuracy && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                      <span className="font-mono font-semibold">
                        ±{Math.round(item.location.accuracy)}m
                      </span>
                    </div>
                  )}
                  {item.location.speed !== null && item.location.speed > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Speed:</span>
                      <span className="font-mono font-semibold text-green-600">
                        {(item.location.speed * 3.6).toFixed(1)} km/h
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LiveMap;