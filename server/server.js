const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB, getDbStatus } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible development asset loading
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration for local frontend communication
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in local dev environment
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Base Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'RELOOP Refurbished Electronics Platform API',
    version: '1.0.0',
    tagline: 'Quality renewed. Value restored.',
    endpoints: {
      health: '/api/health',
      dbHealth: '/api/health/db',
    },
  });
});

/**
 * @route   GET /api/health
 * @desc    Basic API server health and uptime status
 * @access  Public
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'RELOOP API',
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route   GET /api/health/db
 * @desc    Database connection health check
 * @access  Public
 */
app.get('/api/health/db', (req, res) => {
  const dbStatus = getDbStatus();

  if (dbStatus.isHealthy) {
    return res.status(200).json({
      success: true,
      service: 'RELOOP API',
      database: {
        status: dbStatus.status,
        name: dbStatus.database,
        host: dbStatus.host,
        port: dbStatus.port,
        readyState: dbStatus.readyState,
      },
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(503).json({
    success: false,
    service: 'RELOOP API',
    database: {
      status: dbStatus.status,
      readyState: dbStatus.readyState,
    },
    message: 'Database connection is not ready',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const tradeInRoutes = require('./routes/tradeInRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Serve uploaded product assets statically from public directory
app.use('/images/products', express.static(path.resolve(__dirname, '../client/public/images/products')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/trade-in', tradeInRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Centralized Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Server Startup Lifecycle: Only start listening after MongoDB connection succeeds
const startServer = async () => {
  try {
    console.log('[RELOOP Server] Initializing MongoDB connection...');
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[RELOOP Server] Active and listening on port ${PORT}`);
      console.log(`[RELOOP Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[RELOOP Server] Health Endpoint: http://localhost:${PORT}/api/health`);
      console.log(`[RELOOP Server] DB Health Endpoint: http://localhost:${PORT}/api/health/db`);
    });

    // Graceful Shutdown
    const handleShutdown = (signal) => {
      console.log(`\n[RELOOP Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[RELOOP Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));

    return server;
  } catch (error) {
    console.error('[RELOOP Server Startup Error] Could not start server due to database failure:');
    console.error(`- Details: ${error.message}`);
    process.exit(1);
  }
};

// Start server if executed directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
