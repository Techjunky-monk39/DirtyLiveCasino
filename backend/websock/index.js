// Socket.IO server setup for backend
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  // Example: join a blackjack table room
  socket.on('joinTable', (tableId) => {
    socket.join(`blackjack-${tableId}`);
    io.to(`blackjack-${tableId}`).emit('userJoined', socket.id);
  });
  // Example: handle a game action
  socket.on('gameAction', (data) => {
    // Broadcast to everyone at the table
    io.to(`blackjack-${data.tableId}`).emit('gameUpdate', data);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
