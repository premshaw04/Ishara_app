const { Server } = require('socket.io');
const registerEsp32Handlers = require('./esp32Handler');

function setupSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // In production, restrict this to your frontend's URL
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    // Register handlers for ESP32 events
    registerEsp32Handlers(io, socket);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

module.exports = setupSockets;
