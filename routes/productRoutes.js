const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getHomepage, getShop, getSingleProduct, getProfile, postProfilePhoto, getBlogPage, postAddReview, postUpdateProfile, postAddAddress, postDeleteAddress } = require('../controllers/productController');
const { isAuthenticated } = require('../middleware/auth');

// Multer configuration for profile photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Homepage (requires auth)
router.get('/', isAuthenticated, getHomepage);

// Shop page (requires auth)
router.get('/shop', isAuthenticated, getShop);

// Single product page (requires auth)
router.get('/product/:id', isAuthenticated, getSingleProduct);
 
// Review API
router.post('/api/product/review', isAuthenticated, postAddReview);
 
// Profile page (requires auth)
router.get('/profile', isAuthenticated, getProfile);
router.post('/profile/photo', isAuthenticated, upload.single('profilePhoto'), postProfilePhoto);
router.post('/profile/update', isAuthenticated, postUpdateProfile);
router.post('/profile/address/add', isAuthenticated, postAddAddress);
router.get('/profile/address/delete/:index', isAuthenticated, postDeleteAddress);
 
// Static pages (public)
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About Us - EcomSphere',
    user: req.session.username || null,
  });
});

router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact Us - EcomSphere',
    user: req.session.username || null,
  });
});

router.get('/blog', getBlogPage);

module.exports = router;
