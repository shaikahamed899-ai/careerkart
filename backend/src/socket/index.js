const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

// Store connected users
const connectedUsers = new Map();

const initializeSocket = (io) => {
  // Make io globally available for notifications
  global.io = io;
  
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }
      
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });
  
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    
    console.log(`User connected: ${socket.user.name} (${userId})`);
    
    // Join user's personal room
    socket.join(`user_${userId}`);
    
    // Store connection
    connectedUsers.set(userId, socket.id);
    
    // Update user's online status
    updateUserStatus(userId, true);
    
    // Handle joining company room (for employers)
    if (socket.user.employer?.companyId) {
      socket.join(`company_${socket.user.employer.companyId}`);
    }
    
    // Handle custom events
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`User ${userId} joined room: ${room}`);
    });
    
    socket.on('leave_room', (room) => {
      socket.leave(room);
      console.log(`User ${userId} left room: ${room}`);
    });
    
    // Handle typing indicators for chat (if implemented)
    socket.on('typing', (data) => {
      socket.to(data.room).emit('user_typing', {
        userId,
        userName: socket.user.name,
      });
    });
    
    socket.on('stop_typing', (data) => {
      socket.to(data.room).emit('user_stop_typing', {
        userId,
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${userId})`);
      connectedUsers.delete(userId);
      updateUserStatus(userId, false);
    });
  });
  
  return io;
};

// Update user's online status
const updateUserStatus = async (userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(userId, {
      lastActive: new Date(),
    });
  } catch (error) {
    console.error('Error updating user status:', error);
  }
};

// Helper function to emit to specific user
const emitToUser = (userId, event, data) => {
  if (global.io) {
    global.io.to(`user_${userId}`).emit(event, data);
  }
};

// Helper function to emit to company
const emitToCompany = (companyId, event, data) => {
  if (global.io) {
    global.io.to(`company_${companyId}`).emit(event, data);
  }
};

// Check if user is online
const isUserOnline = (userId) => {
  return connectedUsers.has(userId.toString());
};

module.exports = {
  initializeSocket,
  emitToUser,
  emitToCompany,
  isUserOnline,
};
