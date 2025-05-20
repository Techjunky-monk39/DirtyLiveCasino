// Socket.IO client setup for frontend
import { io } from 'socket.io-client';

let socket;

export function connectSocket() {
  socket = io('http://localhost:4000'); // Update if backend runs elsewhere
  socket.on('connect', () => {
    console.log('Connected to Socket.IO server:', socket.id);
  });
}

export function joinTable(tableId) {
  if (socket) {
    socket.emit('joinTable', tableId);
  }
}

export function sendGameAction(data) {
  if (socket) {
    socket.emit('gameAction', data);
  }
}

export function onGameUpdate(callback) {
  if (socket) {
    socket.on('gameUpdate', callback);
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}
