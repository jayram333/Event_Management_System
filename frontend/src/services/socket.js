// Socket.IO client helper with resilient fallback
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socketInstance = null;

class DummySocket {
  constructor() {
    this.connected = false;
  }
  on(event, callback) {}
  off(event, callback) {}
  emit(event, ...args) {
    console.log(`[Socket] Emitted event '${event}' with payload:`, args);
  }
  disconnect() {}
}

export const initSocket = () => {
  if (!socketInstance) {
    if (typeof window !== 'undefined' && window.io) {
      try {
        socketInstance = window.io(SOCKET_URL, {
          autoConnect: true,
          transports: ['websocket', 'polling'],
        });
      } catch (err) {
        console.warn('Socket connection fallback:', err.message);
        socketInstance = new DummySocket();
      }
    } else {
      socketInstance = new DummySocket();
    }
  }
  return socketInstance;
};

export const joinUserRoom = (userId) => {
  const s = initSocket();
  if (s && userId) {
    s.emit('joinUserRoom', userId);
  }
};

export const joinEventRoom = (eventId) => {
  const s = initSocket();
  if (s && eventId) {
    s.emit('joinEventRoom', eventId);
  }
};

export const getSocket = () => socketInstance || initSocket();

export default {
  initSocket,
  joinUserRoom,
  joinEventRoom,
  getSocket,
};
