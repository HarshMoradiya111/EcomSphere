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

router.use(isAuthenticatedApi);

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/update', updateCart);
router.post('/remove', removeFromCart);
router.post('/coupon/apply', applyCoupon);
router.post('/coupon/remove', removeCoupon);
router.post('/loyalty/apply', applyPoints);
router.post('/loyalty/remove', removePoints);

module.exports = router;
