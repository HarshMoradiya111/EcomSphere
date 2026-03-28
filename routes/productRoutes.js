const express = require('express');
const router = express.Router();
const { getHomepage, getShop, getSingleProduct, getProfile } = require('../controllers/productController');
const { isAuthenticated } = require('../middleware/auth');

// Homepage (requires auth)
router.get('/', isAuthenticated, getHomepage);

// Shop page (requires auth)
router.get('/shop', isAuthenticated, getShop);

// Single product page (requires auth)
router.get('/product/:id', isAuthenticated, getSingleProduct);

// Profile page (requires auth)
router.get('/profile', isAuthenticated, getProfile);

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

router.get('/blog', (req, res) => {
  res.render('blog', {
    title: 'Blog - EcomSphere',
    user: req.session.username || null,
  });
});

module.exports = router;
