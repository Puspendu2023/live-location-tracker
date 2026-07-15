import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

export const useLocationStore = create((set, get) => ({
  currentLocation: null,
  locationHistory: [],
  watchId: null,
  isTracking: false,
  error: null,

  // Start tracking
  startTracking: () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          batteryLevel: await getBatteryLevel(),
          networkStatus: navigator.connection?.effectiveType || 'unknown',
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          },
        };

        set({ currentLocation: locationData, error: null });

        // Send to server
        try {
          await axios.post('/location/update', locationData);
        } catch (error) {
          console.error('Failed to update location:', error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        set({ error: error.message });
        
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error('Location information unavailable');
        } else if (error.code === error.TIMEOUT) {
          toast.error('Location request timed out');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    set({ watchId, isTracking: true });
    toast.success('Location tracking started');
  },

  // Stop tracking
  stopTracking: () => {
    const { watchId } = get();
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      set({ watchId: null, isTracking: false });
      toast.success('Location tracking stopped');
    }
  },

  // Get location history
  fetchLocationHistory: async (params = {}) => {
    try {
      const response = await axios.get('/location/history', { params });
      set({ locationHistory: response.data.data.locations });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch location history');
      throw error;
    }
  },

  // Delete location history
  deleteLocationHistory: async (params = {}) => {
    try {
      await axios.delete('/location/history', { data: params });
      toast.success('Location history deleted');
      get().fetchLocationHistory();
    } catch (error) {
      toast.error('Failed to delete location history');
      throw error;
    }
  },
}));

// Helper: Get battery level
async function getBatteryLevel() {
  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();
      return Math.round(battery.level * 100);
    } catch (error) {
      return null;
    }
  }
  return null;
}