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
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
try {
  require('./config/passport');
  console.log('✅ Passport Strategy Loaded');
} catch (err) {
  console.error('❌ Passport Strategy Load Error:', err.message);
}

// Route Aggregator
const routesV1 = require('./routes');

const app = express();

// 0. VIEW ENGINE CONFIG
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

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

// 1.5 SESSION & FLASH CONFIG
app.use(session({
  secret: process.env.SESSION_SECRET || 'ecomsphere_secret_key_12345',
  resave: false,
  saveUninitialized: false,
  store: (MongoStore.create ? MongoStore : MongoStore.default).create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60, // 14 days
  }),
  cookie: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '1800000'), // Default 30 mins
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  }
}));

app.use(flash());

// GLOBAL VIEW LOCALS
app.use((req, res, next) => {
  res.locals.user = req.session.username || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  
  // Resilient bridge detection (Header or Query Param)
  const bridgeHeader = req.headers['x-nextjs-bridge'];
  const bridgeQuery = req.query.bridge;
  const isBridge = bridgeHeader === 'true' || bridgeQuery === 'true';
  
  res.locals.isBridge = isBridge;
  res.locals.__forceSuppressLegacyUI__ = isBridge;
  
  if (isBridge) {
    console.log(`[BRIDGE DETECTED] ${req.method} ${req.path}`);
  }
  
  next();
});

// 2. STATIC FILES (For uploads and images)
app.use(express.static(path.join(__dirname, '../public')));

// 3. PARSERS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. API & VIEW ROUTES
app.use((req, res, next) => {
  if (req.headers['x-nextjs-bridge']) {
    console.log(`Bridge Request: ${req.method} ${req.url}`);
  }
  next();
});

app.use('/api/v1', routesV1.apiRouter);
app.use('/api/cart', require('./routes/v1/cart.api'));
app.use('/', routesV1.viewRouter);

// 4b. ROOT-LEVEL GOOGLE AUTH ROUTES
// Google Console has callback registered at /auth/google/callback (without /api/v1)
// So we mount the same handlers at both paths for compatibility
const jwt = require('jsonwebtoken');
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/auth/login?error=Google auth failed`, session: false }),
  (req, res) => {
    const payload = { id: req.user._id.toString(), role: 'user' };
    const secret = process.env.JWT_SECRET || 'ecomsphere_super_secret_jwt';
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');
    res.redirect(`${clientUrl}/auth/login?token=${token}`);
  }
);

// 5. ROOT ROUTE & HEALTH CHECK
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'EcomSphere API Core - REFRESHED AND UPDATED',
    version: '2.1.0',
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
