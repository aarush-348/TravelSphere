const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = http.createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/tours', require('./routes/tours'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/bookings', require('./routes/bookings'));

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// Socket.io — Travel Buddy Real-Time Chat
// ============================================
const tourRooms = {}; // { tourId: { users: Map<socketId, userName>, groupRequests: Set } }

io.on('connection', (socket) => {
  console.log(`🔗 Socket connected: ${socket.id}`);

  // Join a tour room
  socket.on('join-tour-room', ({ tourId, userName }) => {
    if (!tourId) return;

    // Leave any previous room
    if (socket._currentRoom) {
      leaveRoom(socket, socket._currentRoom);
    }

    socket.join(tourId);
    socket._currentRoom = tourId;
    socket._userName = userName || 'Traveler';

    if (!tourRooms[tourId]) {
      tourRooms[tourId] = { users: new Map(), groupRequests: new Set() };
    }
    tourRooms[tourId].users.set(socket.id, userName);

    const count = tourRooms[tourId].users.size;

    // Broadcast viewer count to all in room
    io.to(tourId).emit('viewer-count', { tourId, count });

    // System message
    socket.to(tourId).emit('system-message', {
      message: `${userName} joined the chat`
    });
  });

  // Leave a tour room
  socket.on('leave-tour-room', ({ tourId }) => {
    leaveRoom(socket, tourId);
  });

  // Chat message
  socket.on('chat-message', ({ tourId, message, userName }) => {
    if (!tourId || !message) return;
    io.to(tourId).emit('chat-message', {
      userName: userName || socket._userName || 'Traveler',
      message,
      timestamp: new Date().toISOString()
    });
  });

  // Group request
  socket.on('group-request', ({ tourId, userName }) => {
    if (!tourId || !tourRooms[tourId]) return;

    const room = tourRooms[tourId];
    room.groupRequests.add(socket.id);

    // If at least 2 people have requested, form the group
    if (room.groupRequests.size >= 2) {
      const discountToken = 'GRP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

      io.to(tourId).emit('group-formed', {
        members: room.groupRequests.size,
        discountToken,
        tourId
      });

      // Store discount token for validation
      if (!global._groupDiscountTokens) global._groupDiscountTokens = new Set();
      global._groupDiscountTokens.add(discountToken);

      // Reset group requests
      room.groupRequests.clear();
    } else {
      // Notify room that someone wants to group
      io.to(tourId).emit('system-message', {
        message: `${userName} wants to group up! 🤝 Need ${2 - room.groupRequests.size} more traveler(s) to unlock 10% discount.`
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (socket._currentRoom) {
      leaveRoom(socket, socket._currentRoom);
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

function leaveRoom(socket, tourId) {
  socket.leave(tourId);
  if (tourRooms[tourId]) {
    const userName = tourRooms[tourId].users.get(socket.id);
    tourRooms[tourId].users.delete(socket.id);
    tourRooms[tourId].groupRequests.delete(socket.id);

    const count = tourRooms[tourId].users.size;
    io.to(tourId).emit('viewer-count', { tourId, count });

    if (userName) {
      socket.to(tourId).emit('system-message', {
        message: `${userName} left the chat`
      });
    }

    // Cleanup empty rooms
    if (count === 0) {
      delete tourRooms[tourId];
    }
  }
}

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`\n🌍 TravelSphere server running on http://localhost:${PORT}\n`);
});
