// SCSS stub loaded via Node's -r flag (see nodemon.json)
// This prevents Node from trying to load .scss files from Payload's node_modules

import express from 'express';
import payload from 'payload';
import path from 'path';
import config from './payload.config';

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * Initialize Payload CMS and Express server
 */
const start = async (): Promise<void> => {
  try {
    // Initialize Payload
    await payload.init({
      config,
      secret: process.env.PAYLOAD_SECRET!,
      express: app,
      onInit: async () => {
        payload.logger.info(`✅ Payload Admin URL: ${payload.getAdminURL()}`);
      },
    });

    // Redirect root to admin
    app.get('/', (req, res) => {
      res.redirect('/admin');
    });

    // Serve static files from public directory
    app.use('/media', express.static(path.resolve(__dirname, '../public/media')));

    // Custom health check endpoint
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // Start Express server
    app.listen(PORT, () => {
      payload.logger.info(`✅ KodaLabs CMS Server listening on port ${PORT}`);
      payload.logger.info(`📊 Admin Panel: http://localhost:${PORT}/admin`);
      payload.logger.info(`🚀 API Endpoint: http://localhost:${PORT}/api`);
      payload.logger.info(`💚 Health Check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      payload.logger.info(`\n${signal} received, closing server gracefully...`);
      process.exit(0);
    };

    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Start the server
start();
