const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
 
// GET /checkout - Checkout page
const getCheckout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.session.userId });
    const user = await User.findById(req.session.userId);
 
    if (!cart || cart.items.length === 0) {
      req.flash('error', 'Your cart is empty');
      return res.redirect('/cart');
    }
 
    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
 
    res.render('checkout', {
      title: 'Checkout - EcomSphere',
      cart: cart.items,
      total: parseFloat(total.toFixed(2)),
      user: user,
      username: req.session.username || null,
      errors: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (error) {
    console.error('Checkout page error:', error);
    req.flash('error', 'Failed to load checkout');
    res.redirect('/cart');
  }
};

// POST /checkout/place-order - Place order
const placeOrder = async (req, res) => {
  try {
    const { name, address, phone } = req.body;

    if (!name || !address || !phone) {
      req.flash('error', 'All delivery details are required');
      return res.redirect('/checkout');
    }

    const cart = await Cart.findOne({ userId: req.session.userId });

    if (!cart || cart.items.length === 0) {
      req.flash('error', 'Your cart is empty');
      return res.redirect('/cart');
    }

    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order with embedded items
    const order = new Order({
      userId: req.session.userId,
      items: cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      })),
      checkoutInfo: {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
      },
      totalQuantity,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      totalAmount: parseFloat(totalPrice.toFixed(2)),
      status: 'Pending',
    });

    await order.save();

    // Clear cart after successful order
    cart.items = [];
    await cart.save();

    res.redirect(`/order-success/${order._id}`);
  } catch (error) {
    console.error('Place order error:', error);
    req.flash('error', 'Failed to place order. Please try again.');
    res.redirect('/checkout');
  }
};

// GET /order-success/:orderId - Order success page
const getOrderSuccess = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.session.userId,
    });

    if (!order) {
      req.flash('error', 'Order not found');
      return res.redirect('/');
    }

    res.render('order_success', {
      title: 'Order Placed! - EcomSphere',
      order,
      user: req.session.username || null,
      success: req.flash('success'),
      errors: req.flash('error'),
    });
  } catch (error) {
    console.error('Order success page error:', error);
    res.redirect('/');
  }
};

// GET /api/orders - Get user's orders (API)
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

// GET /track-order - Track order status page
const getTrackOrder = async (req, res) => {
  try {
    const rawInput = req.query.orderId ? req.query.orderId.trim() : null;
    const orderIdInput = rawInput ? rawInput.replace(/^#/, '') : null;
    
    let order = null;
    let errorMsg = null;

    if (orderIdInput) {
      // First try to match an exact 24-character internal MongoDB ID
      if (mongoose.isValidObjectId(orderIdInput)) {
        order = await Order.findById(orderIdInput);
      } 
      
      // If not found or if the user entered the 8-character short display ID (e.g. 22FFBE8D)
      if (!order && orderIdInput.length >= 6) {
        const allOrders = await Order.find({}).sort({ createdAt: -1 });
        order = allOrders.find(o => o._id.toString().toUpperCase().endsWith(orderIdInput.toUpperCase()));
      }

      if (!order) {
        errorMsg = `No order found matching ID: ${rawInput}`;
      }
    }

    res.render('track_order', {
      title: 'Track Order - EcomSphere',
      user: req.session.username || null,
      order,
      orderId: rawInput,
      errorMsg
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.render('track_order', {
      title: 'Track Order - EcomSphere',
      user: req.session.username || null,
      order: null,
      orderId: req.query.orderId,
      errorMsg: 'An error occurred while tracking the order'
    });
  }
};

module.exports = {
  getCheckout,
  placeOrder,
  getOrderSuccess,
  getUserOrders,
  getTrackOrder,
};
