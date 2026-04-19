const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const User = require('../../models/User');
const { isAuthenticatedApi } = require('../../middleware/auth.api.middleware');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { calculateCartTotals } = require('../../utils/cartCalculator');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_test_secret'
});

// @desc    Calculate totals and create Razorpay order
// @route   POST /api/v1/checkout/prepare
router.post('/prepare', isAuthenticatedApi, async (req, res) => {
  try {
    const { items, state, pointsToRedeem } = req.body;
    
    // Calculate totals using utility
    const { subtotal, taxAmount, shippingFee, finalAmount, pointsDiscount } = calculateCartTotals(
      items,
      0, // discount from coupon (not implemented in this simplified API yet)
      state,
      pointsToRedeem || 0
    );

    let razorpayOrder = null;
    if (finalAmount > 0) {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      });
    }

    res.json({
      success: true,
      subtotal,
      taxAmount,
      shippingFee,
      total: finalAmount,
      pointsDiscount,
      razorpayOrder,
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_test_key'
    });
  } catch (error) {
    console.error('Checkout prepare error:', error);
    res.status(500).json({ success: false, error: 'Failed to prepare checkout' });
  }
});

// @desc    Place final order
// @route   POST /api/v1/checkout/place
router.post('/place', isAuthenticatedApi, async (req, res) => {
  try {
    const { 
      items, 
      shippingInfo, 
      paymentMethod, 
      razorpayDetails,
      totals,
      pointsUsed 
    } = req.body;

    // 1. Stock Validation
    const mongoose = require('mongoose');
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ success: false, error: `Invalid product ID: ${item.productId}` });
      }
      const product = await Product.findById(item.productId);
      if (!product || product.countInStock < item.quantity) {
        return res.status(400).json({ success: false, error: `Insufficient stock for ${item.name}` });
      }
    }

    // 2. Verify Payment if not COD
    if (paymentMethod !== 'cod') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = razorpayDetails;
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_test_secret');
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      if (hmac.digest('hex') !== razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Payment verification failed' });
      }
    }

    // 3. Create Order
    const earnedPoints = Math.floor((totals.total || 0) * 0.01);
    
    const order = new Order({
      userId: req.user.id,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null
      })),
      checkoutInfo: {
        name: shippingInfo.name,
        address: `${shippingInfo.address}, State: ${shippingInfo.state}`,
        phone: shippingInfo.phone
      },
      totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: totals.subtotal || 0,
      taxAmount: totals.taxAmount || 0,
      shippingFee: totals.shippingFee || 0,
      totalAmount: totals.total || 0,
      totalPrice: totals.total || 0,
      discount: (totals.couponDiscount || 0) + (totals.pointsDiscount || 0),
      loyaltyPointsUsed: pointsUsed || 0,
      loyaltyPointsEarned: earnedPoints,
      status: 'Pending',
      paymentDetails: {
        razorpay_payment_id: razorpayDetails?.razorpay_payment_id || null,
        status: paymentMethod === 'cod' ? 'Pending' : 'Paid'
      }
    });

    await order.save();

    // 4. Update User (Points & Loyalty)
    const user = await User.findById(req.user.id);
    if (user) {
      if (pointsUsed > 0) {
        user.loyaltyPoints = Math.max(0, user.loyaltyPoints - pointsUsed);
        user.loyaltyHistory.push({ 
          points: pointsUsed, 
          reason: `Redeemed for Order #${order._id.toString().slice(-6)}`, 
          type: 'redeem' 
        });
      }
      
      if (earnedPoints > 0) {
        user.loyaltyPoints += earnedPoints;
        user.loyaltyHistory.push({ 
          points: earnedPoints, 
          reason: `Earned from Order #${order._id.toString().slice(-6)}`, 
          type: 'earn' 
        });
      }
      await user.save();
    }

    // 5. Update Stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { countInStock: -item.quantity } });
    }

    // 6. Clear Server Cart
    const Cart = require('../../models/Cart');
    await Cart.findOneAndDelete({ userId: req.user.id });

    console.log(`✅ Order placed successfully: ${order._id}`);
    res.json({ success: true, orderId: order._id });
  } catch (error) {
    console.error('CRITICAL: Place order error:', error);
    // Return more specific error in dev if possible, but keep it secure
    const errorMsg = error.name === 'ValidationError' 
      ? `Validation failed: ${Object.keys(error.errors).join(', ')}` 
      : 'Failed to place order';
    res.status(500).json({ success: false, error: errorMsg });
  }
});

module.exports = router;
