const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
require('./config/passport');

// Route Aggregator
const routesV1 = require('./routes');

const app = express();

// Initialize Passport
app.use(passport.initialize());

// 0. PRODUCTION SECURITY & LOAD BALANCER CONFIG
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// 1. GLOBAL MIDDLEWARE
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'http://localhost:3001', 
    'http://127.0.0.1:3001',
    'https://ecomsphere.vercel.app',
    process.env.CLIENT_URL,
    /\.onrender\.com$/ 
  ].filter(Boolean),
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  message: {
    success: false,
    error: 'Too many requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2. STATIC FILES (For uploads and images)
app.use(express.static(path.join(__dirname, '../public')));

// 3. PARSERS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. API ROUTES
app.use('/api/v1', routesV1.apiRouter);

// 5. ROOT ROUTE & HEALTH CHECK
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'EcomSphere API Core is active',
    version: '2.0.0',
    environment: process.env.NODE_ENV
  });
});

app.get('/debug-auth', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Latest OAuth code is active',
    callback_url: process.env.CALLBACK_URL,
    client_url: process.env.CLIENT_URL
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/img/placeholder.jpg', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#e2e8f0"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" dy=".3em">No Image</text></svg>');
});

// 6. ERROR HANDLING & FALLBACKS
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).json({ 
    success: false, 
    error: err.message || 'Something went wrong',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
