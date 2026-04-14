const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const Product = require('../../models/Product');

// @desc    Create new order from Next.js Checkout
// @route   POST /api/v1/orders
router.post('/', async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Empty payload detected' });
    }

    const order = new Order({
      user: req.body.userId || null, // Optional for guest checkout parity
      items,
      shippingAddress,
      totalAmount,
      paymentMethod,
      status: 'Processing'
    });

    await order.save();

    // 📉 Update Stock Levels
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { countInStock: -item.quantity }
      });
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Checkout Engine Failure:', error);
    res.status(500).json({ success: false, error: 'Payment/Order synchronization failed' });
  }
});

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
