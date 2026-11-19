const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const configurePassport = require('./config/passport');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();
const allowedOrigins = new Set([
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  ...(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
]);
const windowMs = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    const error = new Error('Origin is not allowed by CORS');
    error.statusCode = 403;
    return callback(error);
  }
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(configurePassport().initialize());
const authRateLimit = rateLimit({
  windowMs: Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 900000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

app.get('/health', (request, response) => response.json({ status: 'ok' }));
if (process.env.NODE_ENV === 'production') {
  app.use('/api/auth/login', authRateLimit);
  app.use('/api/auth/register', authRateLimit);
}
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
