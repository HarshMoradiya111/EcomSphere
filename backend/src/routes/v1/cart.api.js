const express = require('express');
const router = express.Router();
const { 
    getCart, 
    addToCart, 
    updateCart, 
    removeFromCart, 
    applyCoupon, 
    removeCoupon, 
    applyPoints, 
    removePoints 
} = require('../../controllers/cart.controller');
const { isAuthenticatedApi } = require('../../middleware/auth.api.middleware');

// We need to decide: should cart be session based or DB based for API?
// The controller currently uses req.session.cart.
// For Next.js (Stateless), we should ideally store Cart in DB or use a persistent session.
// However, to maintain parity with minimal changes, I'll ensure the controller handles req.user.id if available.

// Wrap isAuthenticatedApi to set req.session.userId from JWT for the controller
const bridgeAuth = (req, res, next) => {
    if (req.user) {
        req.session.userId = req.user.id;
    }
    next();
};

router.use(isAuthenticatedApi);
router.use(bridgeAuth);

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/update', updateCart);
router.post('/remove', removeFromCart);
router.post('/coupon/apply', applyCoupon);
router.post('/coupon/remove', removeCoupon);
router.post('/loyalty/apply', applyPoints);
router.post('/loyalty/remove', removePoints);

module.exports = router;
