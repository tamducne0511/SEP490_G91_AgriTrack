import { io } from "socket.io-client";

// Determine the socket URL based on environment
const getSocketURL = () => {
  // Check if we're in development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // For local development, use localhost backend
    return process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
  }
  // For production, use the production API
  return "https://api-agritrack.ungdunghay.info.vn";
};

// Socket configuration with CORS support
const socketConfig = {
  transports: ['polling', 'websocket'],
  timeout: 20000,
  forceNew: true,
  // CORS configuration
  withCredentials: true,
  // Additional options for CORS
  extraHeaders: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
};

// Create socket connection
export const socket = io(getSocketURL(), socketConfig);

// Debug logging
console.log("🔌 [Socket] Connecting to:", getSocketURL());
console.log("🔌 [Socket] Environment:", process.env.NODE_ENV);
console.log("🔌 [Socket] Hostname:", window.location.hostname);

// Socket event listeners for debugging
socket.on('connect', () => {
  console.log("✅ [Socket] Connected successfully");
});

socket.on('disconnect', (reason) => {
  console.log("❌ [Socket] Disconnected:", reason);
});

socket.on('connect_error', (error) => {
  console.error("❌ [Socket] Connection error:", error);
});
