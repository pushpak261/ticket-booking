/**
 * CORS Configuration for Production and Development
 * Handles multiple origins and environment-specific settings.
 */

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://ticket-booking-ebon-theta.vercel.app',
];

const ENV_ORIGIN_KEYS = [
  'CLIENT_URL',
  'CLIENT_URLS',
  'FRONTEND_URL',
  'FRONTEND_URLS',
  'CORS_ORIGIN',
  'CORS_ORIGINS',
];

const normalizeOrigin = (origin) => {
  if (!origin || typeof origin !== 'string') return null;

  const trimmed = origin.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/+$/, '');
  }
};

const parseOriginList = (value) => (
  (value || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)
);

const getAllowedOrigins = () => {
  const configuredOrigins = ENV_ORIGIN_KEYS.flatMap((key) => parseOriginList(process.env[key]));
  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins])];
};

const baseCorsOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
};

const getCorsOptions = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (nodeEnv === 'production') {
    const allowedOrigins = getAllowedOrigins();

    return {
      ...baseCorsOptions,
      origin: (origin, callback) => {
        // Allow requests with no origin, such as health checks, curl, and server-to-server calls.
        if (!origin) return callback(null, true);

        const normalizedOrigin = normalizeOrigin(origin);

        if (allowedOrigins.includes(normalizedOrigin)) {
          return callback(null, true);
        }

        console.warn(`CORS blocked request from origin: ${origin}`);
        return callback(new Error('Not allowed by CORS policy'));
      },
    };
  }

  return {
    ...baseCorsOptions,
    origin: true,
  };
};

getCorsOptions.getAllowedOrigins = getAllowedOrigins;

module.exports = getCorsOptions;
