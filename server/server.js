
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database and error handler
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const donationRoutes = require('./routes/donationRoutes');
const requestRoutes = require('./routes/requestRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(
        `[Socket.IO] Socket ${socket.id} joined user_${userId}`
      );
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Attach Socket.IO to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Security and utility middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "blob:", "https:"],
        "connect-src": ["'self'", "https:", "wss:"]
      }
    }
  })
);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static uploads directory
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Yumzy API Server',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// React frontend production build
const clientBuildPath = path.join(__dirname, '../client/dist');

app.use(express.static(clientBuildPath));

// React Router fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  res.sendFile(
    path.join(clientBuildPath, 'index.html'),
    (err) => {
      if (err) {
        next(err);
      }
    }
  );
});

// Centralized error handler (must be last)
app.use(errorHandler);

// Render provides PORT automatically
const PORT = process.env.PORT || 5000;

// Start server
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log('===============================================');
    console.log(`YUMZY Backend Server is running on port ${PORT}`);
    console.log(`API Health: http://localhost:${PORT}/api/health`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('===============================================');
  });
}

module.exports = { app, server };
