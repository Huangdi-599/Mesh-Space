// utils/socket.ts
import { Server } from 'socket.io';
import http from 'http';

const connectedUsers = new Map<string, string>();

let io: Server;

export const setupSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId as string;
    if (userId) connectedUsers.set(userId, socket.id);

    socket.on('disconnect', () => {
      connectedUsers.forEach((sid, uid) => {
        if (sid === socket.id) connectedUsers.delete(uid);
      });
    });
  });
};

export const emitNotification = (userId: string, notification: any) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) io.to(socketId).emit('notification', notification);
};
