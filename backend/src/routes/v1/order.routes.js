const express = require('express');
const router = express.Router();
const { getCheckout, createRazorpayOrder, placeOrder, getOrderSuccess, getUserOrders, getTrackOrder, downloadInvoice } = require('../../controllers/order.controller');
const { isAuthenticated } = require('../../middleware/auth.middleware');

router.get('/checkout', isAuthenticated, getCheckout);
router.post('/checkout/razorpay/create', isAuthenticated, createRazorpayOrder);
router.post('/checkout/place-order', isAuthenticated, placeOrder);
router.get('/order-success/:orderId', isAuthenticated, getOrderSuccess);
router.get('/api/orders', isAuthenticated, getUserOrders);
router.get('/orders/invoice/:id', isAuthenticated, downloadInvoice);
router.get('/track-order', getTrackOrder);

module.exports = router;
