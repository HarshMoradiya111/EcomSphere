const express = require('express');
const router = express.Router();
const { getWishlistPage, toggleWishlist } = require('../../controllers/wishlist.controller');
const { isAuthenticated } = require('../../middleware/auth.middleware');

router.get('/wishlist', isAuthenticated, getWishlistPage);
router.post('/api/wishlist/toggle', isAuthenticated, toggleWishlist);

module.exports = router;
