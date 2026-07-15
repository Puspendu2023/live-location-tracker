import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMoon, 
  FiSun, 
  FiBell, 
  FiGlobe,
  FiSliders,
  FiShield,
  FiSave,
} from 'react-icons/fi';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Settings = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      geofenceEntry: true,
      geofenceExit: true,
      userOnline: true,
      userOffline: false,
      lowAccuracy: true,
      gpsDisabled: true,
      sosAlerts: true,
    },
    tracking: {
      interval: 5, // seconds
      highAccuracy: true,
      autoStart: false,
      backgroundTracking: false,
    },
    display: {
      units: 'metric', // metric or imperial
      language: 'en',
      mapTheme: 'auto',
      showSpeed: true,
      showAltitude: true,
    },
    privacy: {
      shareLocation: true,
      showOnMap: true,
      allowMessages: true,
    },
  });

  useEffect(() => {
    // Load settings from user preferences
    if (user?.preferences) {
      setSettings(user.preferences);
    }
  }, [user]);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    
    const result = await updateProfile({
      preferences: settings,
    });

    setLoading(false);

    if (result.success) {
      toast.success('Settings saved successfully');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings ⚙️
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your tracking experience
        </p>
      </div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 rounded-xl"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          {theme === 'dark' ? <FiMoon /> : <FiSun />}
          Appearance
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Theme</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose your preferred color scheme
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Language</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select your language
              </p>
            </div>
            <select
              value={settings.display.language}
              onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="pt">Português</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Units</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Distance and speed units
              </p>
            </div>
            <select
              value={settings.display.units}
              onChange={(e) => handleSettingChange('display', 'units', e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="metric">Metric (km, km/h)</option>
              <option value="imperial">Imperial (mi, mph)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-6 rounded-xl"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiBell />
          Notifications
        </h2>

        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('notifications', key, !value)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  value ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    value ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tracking Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass p-6 rounded-xl"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiSliders />
          Tracking Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Update Interval
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="2"
                max="30"
                value={settings.tracking.interval}
                onChange={(e) => handleSettingChange('tracking', 'interval', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-semibold w-16 text-right">
                {settings.tracking.interval}s
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              How often to update your location (lower values use more battery)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">High Accuracy GPS</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use GPS for better accuracy (uses more battery)
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('tracking', 'highAccuracy', !settings.tracking.highAccuracy)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.tracking.highAccuracy ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.tracking.highAccuracy ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Auto-Start Tracking</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start tracking automatically on login
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('tracking', 'autoStart', !settings.tracking.autoStart)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.tracking.autoStart ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.tracking.autoStart ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Background Tracking</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Continue tracking when app is in background
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('tracking', 'backgroundTracking', !settings.tracking.backgroundTracking)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.tracking.backgroundTracking ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.tracking.backgroundTracking ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Privacy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass p-6 rounded-xl"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiShield />
          Privacy & Security
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Share Location</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Allow others to see your location
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('privacy', 'shareLocation', !settings.privacy.shareLocation)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.privacy.shareLocation ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.privacy.shareLocation ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Show on Live Map</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Display your marker on the live map
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('privacy', 'showOnMap', !settings.privacy.showOnMap)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.privacy.showOnMap ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.privacy.showOnMap ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Allow Messages</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Let other users send you messages
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('privacy', 'allowMessages', !settings.privacy.allowMessages)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.privacy.allowMessages ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.privacy.allowMessages ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Display Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass p-6 rounded-xl"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiGlobe />
          Display Options
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Show Speed</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Display speed on map and dashboard
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('display', 'showSpeed', !settings.display.showSpeed)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.display.showSpeed ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.display.showSpeed ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Show Altitude</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Display altitude information
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('display', 'showAltitude', !settings.display.showAltitude)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.display.showAltitude ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.display.showAltitude ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FiSave size={20} />
          {loading ? 'Saving...' : 'Save All Settings'}
        </button>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass p-6 rounded-xl border-l-4 border-red-500"
      >
        <h2 className="text-xl font-bold text-red-600 mb-4">
          Danger Zone
        </h2>
        <div className="space-y-3">
          <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
            Delete All Location History
          </button>
          <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
            Delete Account
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;