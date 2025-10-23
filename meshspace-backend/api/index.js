// api/index.js - Vercel serverless function
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');

// Import database connection
const { connectDB } = require('../dist/config/db');

// Import middleware from dist folder
const { securityHeaders, corsOptions, generalLimiter } = require('../dist/middleware/security');
const { requestLogger, errorLogger, performanceMonitor, logger } = require('../dist/middleware/logging');

// Import compiled routes
const authRoutes = require('../dist/routes/auth').default;
const userRoutes = require('../dist/routes/user').default;
const postRoutes = require('../dist/routes/post').default;
const notificationRoutes = require('../dist/routes/notification').default;

const app = express();

// Connect to MongoDB
connectDB();

// Note: Socket.IO is not supported on Vercel serverless functions
// Real-time features will need to be implemented using polling or external services

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
app.use(requestLogger);
app.use(performanceMonitor);

// Morgan for HTTP request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  }
}));

// Rate limiting
app.use(generalLimiter);

// Error handling middleware
app.use(errorLogger);

// Health check endpoint with UI
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MeshSpace API</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                border-radius: 20px;
                padding: 3rem;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 500px;
                width: 90%;
            }
            .logo {
                font-size: 3rem;
                margin-bottom: 1rem;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .status {
                background: #10b981;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 50px;
                display: inline-block;
                margin: 1rem 0;
                font-weight: 600;
            }
            .info {
                color: #6b7280;
                margin: 1rem 0;
                line-height: 1.6;
            }
            .endpoints {
                background: #f8fafc;
                border-radius: 10px;
                padding: 1.5rem;
                margin: 1.5rem 0;
                text-align: left;
            }
            .endpoint {
                margin: 0.5rem 0;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 0.9rem;
                color: #374151;
            }
            .method {
                display: inline-block;
                padding: 0.2rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: bold;
                margin-right: 0.5rem;
            }
            .get { background: #10b981; color: white; }
            .post { background: #3b82f6; color: white; }
            .put { background: #f59e0b; color: white; }
            .delete { background: #ef4444; color: white; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🚀</div>
            <h1>MeshSpace API</h1>
            <div class="status">✅ Server Running</div>
            <p class="info">
                Your MeshSpace backend API is successfully running!
            </p>
            <div class="endpoints">
                <h3>Available Endpoints:</h3>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span>/api/auth/verify-email</span>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span>/api/auth/register</span>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span>/api/auth/login</span>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span>/api/auth/forgot-password</span>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span>/api/auth/reset-password</span>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span>/api/user/me</span>
                </div>
                <div class="endpoint">
                    <span class="method put">PUT</span>
                    <span>/api/user/me</span>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span>/api/posts/</span>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span>/api/posts/feed</span>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span>/api/notifications/</span>
                </div>
            </div>
            <p class="info">
                <strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}<br>
                <strong>Timestamp:</strong> ${new Date().toISOString()}
            </p>
        </div>
    </body>
    </html>
  `);
});

// Enhanced health check API endpoint
app.get('/api/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    const health = {
      status: 'success',
      message: 'MeshSpace API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: {
          status: dbStatus,
          connection: mongoose.connection.host
        },
        server: {
          uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
          memory: {
            used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
          }
        }
      }
    };

    if (dbStatus !== 'connected') {
      health.status = 'degraded';
      health.message = 'Database connection issue detected';
    }

    res.json(health);
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);

module.exports = app;
