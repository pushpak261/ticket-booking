require('dotenv').config();
const net = require('net');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const BASE_PORT = parseInt(process.env.PORT, 10) || 5000;
const PORT_TRIES = 10;

const isPortFree = (port) => new Promise((resolve) => {
  const tester = net.createServer()
    .once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    })
    .once('listening', () => {
      tester.close(() => resolve(true));
    })
    .listen(port, '127.0.0.1');
});

const getAvailablePort = async (startPort, maxTries) => {
  for (let port = startPort; port < startPort + maxTries; port += 1) {
    if (await isPortFree(port)) {
      return port;
    }
  }
  throw new Error(`No available ports found between ${startPort} and ${startPort + maxTries - 1}`);
};

const startServer = async () => {
  try {
    await connectDB();

    const port = await getAvailablePort(BASE_PORT, PORT_TRIES);
    if (port !== BASE_PORT) {
      console.warn(`⚠️  Port ${BASE_PORT} was busy. Using fallback port ${port} instead.`);
    }

    const server = app.listen(port, () => {
      console.log(`\n🚀 CineBook API running on http://localhost:${port}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
      console.log(`📍 CORS Origin: ${process.env.CLIENT_URL}\n`);
    });

    server.on('error', (err) => {
      console.error('🚨 Server error:', err.message);
      process.exit(1);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('📍 Shutdown signal received: closing HTTP server');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('🚨 Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
