import { io } from "socket.io-client";

// Đổi lại URL nếu backend chạy ở domain/port khác
export const socket = io("http://localhost:3000"); 