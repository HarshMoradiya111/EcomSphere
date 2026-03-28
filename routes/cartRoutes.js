const express = require('express');
const router = express.Router();
const { getCart, getCartPage, addToCart, updateCart, removeFromCart } = require('../controllers/cartController');
const { isAuthenticated } = require('../middleware/auth');

// Cart page view
router.get('/cart', isAuthenticated, getCartPage);

// Cart API endpoints
router.get('/api/cart', isAuthenticated, getCart);
router.post('/api/cart/add', isAuthenticated, addToCart);
router.post('/api/cart/update', isAuthenticated, updateCart);
router.post('/api/cart/remove', isAuthenticated, removeFromCart);

module.exports = router;
