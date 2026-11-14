import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export const createChatSocket = (accessToken) => {
  return io(SOCKET_URL, {
    auth: {
      token: accessToken,
    },

    transports: ["websocket", "polling"],

    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });
};