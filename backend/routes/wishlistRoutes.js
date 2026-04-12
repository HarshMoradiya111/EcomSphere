const express = require('express');
const router = express.Router();
const { getWishlistPage, toggleWishlist } = require('../controllers/wishlistController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/wishlist', isAuthenticated, getWishlistPage);
router.post('/api/wishlist/toggle', isAuthenticated, toggleWishlist);

module.exports = router;
