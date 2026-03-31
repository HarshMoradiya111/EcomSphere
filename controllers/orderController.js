const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const PDFDocument = require('pdfkit');
 
// GET /checkout - Checkout page
const getCheckout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.session.userId });
    const user = await User.findById(req.session.userId);
 
    if (!cart || cart.items.length === 0) {
      req.flash('error', 'Your cart is empty');
      return res.redirect('/cart');
    }
 
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = cart.discountAmount || 0;
    const finalTotal = subtotal - discount;
 
    res.render('checkout', {
      title: 'Checkout - EcomSphere',
      cart: cart.items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      total: parseFloat(finalTotal.toFixed(2)),
      appliedCoupon: cart.appliedCoupon,
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
 
    // FINAL STOCK VALIDATION before creating order
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || product.countInStock < item.quantity) {
        req.flash('error', `Insufficient stock for ${item.name}. Please update your cart.`);
        return res.redirect('/cart');
      }
    }


    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = cart.discountAmount || 0;
    const totalPrice = subtotal - discountAmount;

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
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discountAmount.toFixed(2)),
      appliedCoupon: cart.appliedCoupon,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      totalAmount: parseFloat(totalPrice.toFixed(2)),
      status: 'Pending',
    });

    await order.save();
 
    // Decrement stock for each item
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { countInStock: -item.quantity }
      });
    }


    // Clear cart after successful order
    cart.items = [];
    cart.appliedCoupon = null;
    cart.discountAmount = 0;
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

 // GET /orders/invoice/:id
 const downloadInvoice = async (req, res) => {
   try {
     const order = await Order.findById(req.params.id);
     if (!order || (order.userId.toString() !== req.session.userId && !req.session.adminId)) {
       return res.status(403).send('Unauthorized');
     }
 
     const settings = await Settings.findOne() || { address: "SSCCS Mumbai", phone: "+91 8160730726", email: "support@ecomsphere.com" };
 
     const doc = new PDFDocument({ margin: 50, size: 'A4' });
     
     // Set Response Headers
     res.setHeader('Content-Type', 'application/pdf');
     res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order._id.toString().slice(-6).toUpperCase()}.pdf`);
 
     doc.pipe(res);
 
     // --- HEADER ---
     doc.fillColor('#088178').fontSize(24).text('ECOMSPHERE', 50, 45);
     doc.fillColor('#444444').fontSize(10).text(settings.address || 'EcomSphere Headquarters', 200, 50, { align: 'right' });
     doc.text(`${settings.phone} | ${settings.email}`, 200, 65, { align: 'right' });
     doc.moveDown();
 
     // --- HORIZONTAL LINE ---
     doc.strokeColor('#eeeeee').lineWidth(1).moveTo(50, 90).lineTo(550, 90).stroke();
 
     // --- BILLING INFO ---
     doc.fontSize(14).text('INVOICE', 50, 110);
     doc.fontSize(10).fillColor('#888888').text(`Invoice No: INV-${order._id.toString().slice(-6).toUpperCase()}`, 50, 130);
     doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 145);
 
     doc.fillColor('#000000').fontSize(12).text('Bill To:', 300, 110);
     doc.fontSize(10).text(order.checkoutInfo.name, 300, 130);
     doc.text(order.checkoutInfo.address, 300, 145, { width: 250 });
     doc.text(`Phone: ${order.checkoutInfo.phone}`, 300, 175);
 
     doc.moveDown(4);
 
     // --- TABLE HEADER ---
     const tableTop = 230;
     doc.font('Helvetica-Bold');
     doc.text('Item', 50, tableTop);
     doc.text('Price', 280, tableTop, { width: 90, align: 'right' });
     doc.text('Qty', 370, tableTop, { width: 90, align: 'right' });
     doc.text('Total', 470, tableTop, { width: 80, align: 'right' });
     
     doc.strokeColor('#088178').lineWidth(2).moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
     
     // --- ITEMS ---
     let rowY = tableTop + 30;
     doc.font('Helvetica');
     
     order.items.forEach(item => {
       const itemPrice = item.price || 0;
       const itemQty = item.quantity || 1;
       const itemTotal = itemPrice * itemQty;
       doc.text(item.name, 50, rowY, { width: 220 });
       doc.text(`INR ${itemPrice.toFixed(2)}`, 280, rowY, { width: 90, align: 'right' });
       doc.text(itemQty.toString(), 370, rowY, { width: 90, align: 'right' });
       doc.text(`INR ${itemTotal.toFixed(2)}`, 470, rowY, { width: 80, align: 'right' });
       
       rowY += 25;
       
       // Draw subtle line between rows
       doc.strokeColor('#f9f9f9').lineWidth(0.5).moveTo(50, rowY - 5).lineTo(550, rowY - 5).stroke();
     });
 
     // --- SUMMARY ---
     doc.moveDown(2);
     const summaryY = Math.max(rowY + 20, 350); 
     
     doc.font('Helvetica-Bold');
     doc.text('Subtotal', 350, summaryY);
     doc.font('Helvetica');
     doc.text(`INR ${order.subtotal.toFixed(2)}`, 450, summaryY, { align: 'right', width: 100 });
 
     if (order.discount > 0) {
       doc.fillColor('#088178');
       doc.text(`Discount (${order.appliedCoupon || 'Promo'})`, 350, summaryY + 20);
       doc.text(`- INR ${order.discount.toFixed(2)}`, 450, summaryY + 20, { align: 'right', width: 100 });
       doc.fillColor('#000000');
     }
 
     doc.fontSize(14).font('Helvetica-Bold');
     doc.text('Grand Total', 350, summaryY + 45);
     doc.text(`INR ${order.totalAmount.toFixed(2)}`, 450, summaryY + 45, { align: 'right', width: 100 });
 
     // --- FOOTER ---
     doc.fontSize(10).fillColor('#aaaaaa').text('Thank you for shopping with EcomSphere!', 50, 750, { align: 'center', width: 500 });
 
     doc.end();
   } catch (error) {
     console.error('Invoice error:', error);
     res.status(500).send('Error generating invoice');
   }
 };
 
 module.exports = {
   getCheckout,
   placeOrder,
   getOrderSuccess,
   getUserOrders,
   getTrackOrder,
   downloadInvoice,
 };

