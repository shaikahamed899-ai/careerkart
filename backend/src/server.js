const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const passport = require('passport');
const dotenv = require('dotenv');

dotenv.config(); // Load env variables early

// Import config AFTER dotenv
const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { initializeSocket } = require('./socket');

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Init Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: config.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Setup socket listeners
initializeSocket(io);

// Make IO available in routes
app.set('io', io);

// ===== Global Middleware =====

// Security
app.use(helmet());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with or without trailing slash
    const allowedOrigins = [
      config.FRONTEND_URL,
      config.FRONTEND_URL?.replace(/\/$/, ''),
      config.FRONTEND_URL?.replace(/\/$/, '') + '/',
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Compression
app.use(compression());

// Logging
app.use(morgan("dev"));

// Rate Limiter
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

// ===== Passport Config =====
require('./config/passport')(passport);  // Register all passport strategies FIRST
app.use(passport.initialize());           // Then initialize passport

// ===== Routes =====
app.get('/health', (req, res) => {
  res.json({ status: "OK", date: new Date() });
});

// API routes
app.use('/api', routes);

// Error handlers (always last)
app.use(notFound);
app.use(errorHandler);

// ===== Start Server & DB Connect =====
const startServer = async () => {
  try {
    console.log("Connecting to:", config.MONGODB_URI);

    await mongoose.connect(config.MONGODB_URI, {
      autoIndex: true,
    });

    console.log("✅ MongoDB Connected Successfully");

    httpServer.listen(config.PORT, () => {
      console.log(`🚀 Server running at http://localhost:${config.PORT} in ${config.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io };
