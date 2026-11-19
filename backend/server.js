const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const http = require('http');
const mongoose = require('mongoose');
const connectDatabase = require('./config/db');

function validateEnvironment() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set to at least 32 characters');
  }
  if (!/^([1-9]\d*)(s|m|h|d)$/.test(process.env.JWT_EXPIRES_IN || '1d')) {
    throw new Error('JWT_EXPIRES_IN must be a positive number followed by s, m, h, or d');
  }
}

async function startServer() {
  validateEnvironment();
  await connectDatabase();

  const app = require('./app');
  const server = http.createServer(app);
  const port = Number.parseInt(process.env.PORT || '5000', 10);
  server.listen(port, () => console.info(`Clinic API listening on port ${port}`));

  let isShuttingDown = false;
  const shutdown = (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.info(`${signal} received; shutting down gracefully`);
    server.close(async (error) => {
      try {
        await mongoose.disconnect();
        if (error) {
          console.error('HTTP server shutdown failed:', error);
          process.exitCode = 1;
        }
      } catch (disconnectError) {
        console.error('MongoDB shutdown failed:', disconnectError);
        process.exitCode = 1;
      }
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((error) => {
  console.error('Unable to start clinic API:', error);
  process.exitCode = 1;
});
