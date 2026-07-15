import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCalendar, 
  FiDownload, 
  FiTrash2, 
  FiFilter,
  FiMapPin,
  FiClock,
  FiNavigation,
} from 'react-icons/fi';
import { format } from 'date-fns';
import { useLocationStore } from '../store/locationStore';
import LiveMapComponent from '../components/Map/LiveMap';
import toast from 'react-hot-toast';

const LocationHistory = () => {
  const { fetchLocationHistory, deleteLocationHistory } = useLocationStore();
  const [locations, setLocations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchLocationHistory({
        ...filters,
        limit: 1000,
      });
      setLocations(data.locations);
      setStats(data.stats);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your location history?')) {
      return;
    }

    try {
      await deleteLocationHistory(filters);
      loadHistory();
    } catch (error) {
      toast.error('Failed to delete history');
    }
  };

  const handleExport = () => {
    // Convert to CSV
    const headers = ['Timestamp', 'Latitude', 'Longitude', 'Accuracy', 'Speed', 'Altitude'];
    const csvData = locations.map(loc => [
      format(new Date(loc.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      loc.latitude,
      loc.longitude,
      loc.accuracy || '',
      loc.speed || '',
      loc.altitude || '',
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.join(',')),
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `location-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('History exported successfully');
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = () => {
    loadHistory();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Location History 📊
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your location tracking history
          </p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="glass p-6 rounded-xl">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <button
            onClick={applyFilters}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiFilter size={18} />
            Apply
          </button>
          
          <button
            onClick={handleExport}
            disabled={locations.length === 0}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload size={18} />
            Export CSV
          </button>
          
          <button
            onClick={handleDelete}
            disabled={locations.length === 0}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiTrash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FiMapPin className="text-blue-600" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {locations.length}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Records
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <FiNavigation className="text-purple-600" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {(stats.totalDistance / 1000).toFixed(2)} km
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Distance Traveled
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FiClock className="text-green-600" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {(stats.averageSpeed * 3.6).toFixed(1)} km/h
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average Speed
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <FiClock className="text-orange-600" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.floor(stats.duration / 3600)}h {Math.floor((stats.duration % 3600) / 60)}m
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Duration
            </p>
          </motion.div>
        </div>
      )}

      {/* Route Map */}
      {locations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-xl"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Route Map
          </h2>
          <LiveMapComponent
            locations={locations.map(loc => ({
              user: { id: 'you', name: 'You', email: '', avatar: null },
              location: loc,
            }))}
            height="500px"
            showControls={false}
          />
        </motion.div>
      )}

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 rounded-xl"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Timeline
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner border-primary-600" />
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-12">
            <FiMapPin className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">
              No location history found
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {locations.map((location, index) => (
              <div
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <FiMapPin className="text-primary-600" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Location #{locations.length - index}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(location.timestamp), 'PPp')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Lat:</span>{' '}
                      <span className="font-mono">{location.latitude.toFixed(6)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Lng:</span>{' '}
                      <span className="font-mono">{location.longitude.toFixed(6)}</span>
                    </div>
                    {location.accuracy && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>{' '}
                        <span className="font-mono">±{Math.round(location.accuracy)}m</span>
                      </div>
                    )}
                    {location.speed !== null && location.speed > 0 && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Speed:</span>{' '}
                        <span className="font-mono text-green-600">
                          {(location.speed * 3.6).toFixed(1)} km/h
                        </span>
                      </div>
                    )}
                  </div>
                  {location.address && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      📍 {location.address}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LocationHistory;