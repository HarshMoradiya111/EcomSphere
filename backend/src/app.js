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
const cors = require('cors');
const passport = require('./config/passport');

// Models (needed for global template variables)
const Settings = require('./models/Settings');
const Product = require('./models/Product');

// Route Aggregator
const routesV1 = require('./routes');

const app = express();

// 0. PRODUCTION SECURITY & LOAD BALANCER CONFIG
// Trusting Render's proxy is required for secure cookies/sessions to work
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}


// 1. GLOBAL MIDDLEWARE
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://127.0.0.1:3001',
    process.env.CLIENT_URL,
    // Allow Render's own domain just in case
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
  max: 100,
  message: '🛑 Security lockdown engaged. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/auth/login', limiter);
app.use('/api', limiter);

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2. VIEW ENGINE & STATIC FILES
app.set('view engine', 'ejs');
// Note: __dirname is backend/src, so views are in ../views
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

// 3. PARSERS & SESSIONS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'ecomsphere_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomsphere',
      touchAfter: 24 * 60 * 60,
    }),
    cookie: {
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 30 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// 4. GLOBAL TEMPLATE VARIABLES
app.use(async (req, res, next) => {
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

// 5. API ROUTES (V1 - Future Storefront)
app.use('/api/v1', routesV1.apiRouter);

// 6. LEGACY ROUTES (V1 - Current Production System)
app.use('/', routesV1.ejsRouter);

// 6. ERROR HANDLING & FALLBACKS
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/img/placeholder.jpg', (req, res) => {

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#e2e8f0"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" dy=".3em">No Image</text></svg>');
});

app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found', user: req.session.username || null });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).render('error', { 
    title: 'Error - EcomSphere', 
    message: err.message || 'Something went wrong',
    user: req.session.username || null 
  });
});

module.exports = app;
