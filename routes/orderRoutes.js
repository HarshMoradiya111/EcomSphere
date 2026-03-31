const express = require('express');
const router = express.Router();
const { getCheckout, placeOrder, getOrderSuccess, getUserOrders, getTrackOrder, downloadInvoice } = require('../controllers/orderController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/checkout', isAuthenticated, getCheckout);
router.post('/checkout/place-order', isAuthenticated, placeOrder);
router.get('/order-success/:orderId', isAuthenticated, getOrderSuccess);
router.get('/api/orders', isAuthenticated, getUserOrders);
router.get('/orders/invoice/:id', isAuthenticated, downloadInvoice);
router.get('/track-order', getTrackOrder);

module.exports = router;
