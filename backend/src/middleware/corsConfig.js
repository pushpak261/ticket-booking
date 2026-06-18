/**
 * CORS Configuration for Production and Development
 * Handles multiple origins and environment-specific settings
 */

const getCorsOptions = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  
  // Production: Allow specific frontend URLs
  if (nodeEnv === 'production') {
    // Allow multiple frontend URLs (e.g., deployed app, staging)
    const allowedOrigins = clientUrl.split(',').map(url => url.trim());
    
    return {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
          callback(new Error('Not allowed by CORS policy'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600, // 10 minutes
    };
  }

  // Development: Allow all origins for easier testing
  return {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  };
};

module.exports = getCorsOptions;
