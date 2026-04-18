const express = require('express');
const router = express.Router();
const { getCart, getCartPage, addToCart, updateCart, removeFromCart, applyCoupon, removeCoupon, applyPoints, removePoints } = require('../../controllers/cart.controller');
const { isAuthenticated } = require('../../middleware/auth.middleware');

// Cart page view
router.get('/cart', isAuthenticated, getCartPage);

// Cart API endpoints
router.get('/api/cart', isAuthenticated, getCart);
router.post('/api/cart/add', isAuthenticated, addToCart);
router.post('/api/cart/update', isAuthenticated, updateCart);
router.post('/api/cart/remove', isAuthenticated, removeFromCart);
router.post('/api/cart/coupon/apply', isAuthenticated, applyCoupon);
router.post('/api/cart/coupon/remove', isAuthenticated, removeCoupon);
router.post('/api/cart/loyalty/apply', isAuthenticated, applyPoints);
router.post('/api/cart/loyalty/remove', isAuthenticated, removePoints);

module.exports = router;
