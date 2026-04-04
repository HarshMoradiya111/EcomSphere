require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const methodOverride = require('method-override');
const path = require('path');
const Settings = require('./models/Settings');
const Product = require('./models/Product');
const passport = require('./config/passport');

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware: Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Rate limiting: Anti-Brute Force Protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: '🛑 Too many requests from this IP! Security lockdown engaged. Please try again after 15 minutes.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply to sensitive routes
app.use('/auth/login', limiter);
app.use('/api', limiter); 

// Data Sanitization: Defensive against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization: Defensive against XSS (Cross Site Scripting)
app.use(xss());

// Prevent Parameter Pollution (e.g. multiple "sort" params)
app.use(hpp());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Method override for PUT/DELETE via forms
app.use(methodOverride('_method'));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'ecomsphere_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomsphere',
      touchAfter: 24 * 60 * 60, // lazy session update
    }),
    cookie: {
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 30 * 60 * 1000, // 30 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  })
);

// Flash messages
app.use(flash());
 
 // Passport middleware
 app.use(passport.initialize());
 app.use(passport.session());


// Global template variables middleware
app.use(async (req, res, next) => {
  // Passport populates req.user. If present, sync with existing session logic
  if (req.user) {
    req.session.userId = req.user._id.toString();
    req.session.username = req.user.username;
  }

  res.locals.sessionUser = req.session.username || null;
  res.locals.sessionUserId = req.session.userId || null;
  res.locals.isAdmin = !!req.session.adminId;
  res.locals.adminUsername = req.session.adminUsername || null;

  
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.locals.settings = settings;
  } catch(e) {
    res.locals.settings = { address: "SSCCS", phone: "+91 8160730726", hours: "10:00 - 18:00", email: "", logo: "/img/logo1.png" };
  }

  // Fetch low stock count for admin global header
  if (res.locals.isAdmin) {
    try {
      res.locals.globalLowStockCount = await Product.countDocuments({ countInStock: { $lte: 5 } });
    } catch (e) {
      res.locals.globalLowStockCount = 0;
    }
  } else {
    res.locals.globalLowStockCount = 0;
  }
  
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/', productRoutes);
app.use('/', cartRoutes);
app.use('/', orderRoutes);
app.use('/', wishlistRoutes);
app.use('/admin', adminRoutes);

// Redirect root to login if not authenticated
app.get('/admin', (req, res) => res.redirect('/admin/login'));

// Fallback to instantly break any infinite `onerror` image loops in the browser
app.get('/img/placeholder.jpg', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#e2e8f0"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" dy=".3em">No Image</text></svg>');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found',
    user: req.session.username || null,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).render('error', {
    title: 'Error - EcomSphere',
    message: err.message || 'Something went wrong',
    user: req.session.username || null,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 EcomSphere server running on http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin/login`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
