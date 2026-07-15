import { create } from 'zustand';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,
  onlineUsers: [],
  liveLocations: new Map(),

  // Connect to socket
  connect: (token) => {
    if (get().socket?.connected) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      set({ connected: true });
      toast.success('Connected to live tracking');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ connected: false });
      toast.error('Disconnected from live tracking');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Connection failed');
    });

    // User events
    socket.on('user:online', (user) => {
      set((state) => ({
        onlineUsers: [...state.onlineUsers, user],
      }));
      toast.success(`${user.name} is now online`);
    });

    socket.on('user:offline', (user) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.filter((u) => u.id !== user.id),
      }));
    });

    // Location events
    socket.on('location:broadcast', (data) => {
      set((state) => {
        const newLocations = new Map(state.liveLocations);
        newLocations.set(data.user.id, {
          user: data.user,
          location: data.location,
        });
        return { liveLocations: newLocations };
      });
    });

    // Notification events
    socket.on('notification:new', (notification) => {
      toast(notification.message, {
        icon: '🔔',
        duration: 5000,
      });
    });

    // SOS events
    socket.on('sos:alert', (data) => {
      toast.error(`SOS Alert from ${data.user.name}!`, {
        duration: 10000,
      });
    });

    set({ socket });
  },

  // Disconnect socket
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false, onlineUsers: [], liveLocations: new Map() });
    }
  },

  // Emit location update
  emitLocation: (locationData) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit('location:update', locationData);
    }
  },

  // Send chat message
  sendMessage: (receiverId, message) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit('chat:send', { receiverId, message });
    }
  },

  // Trigger SOS
  triggerSOS: (latitude, longitude, message) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit('sos:trigger', { latitude, longitude, message });
      toast.success('SOS alert sent!');
    }
  },
}));