const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { sendMail } = require('../config/mailer');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { calculateCartTotals } = require('../utils/cartCalculator');
const { mailQueue } = require('../utils/mailQueue');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_test_secret'
});

// GET /checkout - Checkout page
const getCheckout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.session.userId });
    const user = await User.findById(req.session.userId);
 
    if (!cart || cart.items.length === 0) {
      req.flash('error', 'Your cart is empty');
      return res.redirect('/cart');
    }
 
    const { subtotal, taxAmount, finalAmount } = calculateCartTotals(
      cart.items, 
      cart.discountAmount, 
      '', 
      cart.pointsDiscount
    );
 
    res.render('checkout', {
      title: 'Checkout - EcomSphere',
      cart: cart.items,
      subtotal,
      discount: parseFloat((cart.discountAmount || 0).toFixed(2)),
      taxAmount,
      total: finalAmount,
      appliedCoupon: cart.appliedCoupon,
      pointsUsed: cart.pointsUsed || 0,
      pointsDiscount: cart.pointsDiscount || 0,
      user: user,
      username: req.session.username || null,
      errors: req.flash('error'),
      success: req.flash('success'),
      breadcrumbs: [
        { name: 'Shopping Cart', url: '/cart' },
        { name: 'Checkout', url: '/checkout' }
      ]
    });
  } catch (error) {
    console.error('Checkout page error:', error);
    req.flash('error', 'Failed to load checkout');
    res.redirect('/cart');
  }
};

// POST /checkout/razorpay/create - Create Razorpay Order
const createRazorpayOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.session.userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const { state } = req.body;

    const { finalAmount } = calculateCartTotals(
      cart.items, 
      cart.discountAmount, 
      state, 
      cart.pointsDiscount
    );
    
    // finalAmount mathematically prevents it from dropping below 1
    const options = {
      amount: Math.round(finalAmount * 100), // amount in paisa
      currency: "INR",
      receipt: `receipt_order_${new Date().getTime()}`
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      amount: order.amount,
      id: order.id,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_test_key'
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
};

// POST /checkout/place-order - Place order
const placeOrder = async (req, res) => {
  try {
    const { name, address, state, phone, paymentMethod, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!name || !address || !phone || !state) {
      req.flash('error', 'All delivery details are required');
      return res.redirect('/checkout');
    }

    if (paymentMethod !== 'cod') {
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
         req.flash('error', 'Payment verification failed. Please complete the payment.');
         return res.redirect('/checkout');
      }

      // Verify Signature
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_test_secret');
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generated_signature = hmac.digest('hex');

      if (generated_signature !== razorpay_signature) {
        req.flash('error', 'Payment signature mismatch. Transaction failed.');
        return res.redirect('/checkout');
      }
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

    const { subtotal, taxAmount, shippingFee, totalPrice, finalAmount, loyaltyPointsEarned } = calculateCartTotals(
      cart.items, 
      cart.discountAmount, 
      state, 
      cart.pointsDiscount
    );

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
        address: `${address.trim()}, State: ${state}`,
        phone: phone.trim(),
      },
      totalQuantity,
      subtotal: subtotal,
      discount: parseFloat(((cart.discountAmount || 0) + (cart.pointsDiscount || 0)).toFixed(2)),
      shippingFee: shippingFee,
      taxAmount: taxAmount,
      appliedCoupon: cart.appliedCoupon,
      loyaltyPointsUsed: cart.pointsUsed || 0,
      loyaltyPointsEarned: loyaltyPointsEarned,
      totalPrice: totalPrice,
      totalAmount: finalAmount,
      status: 'Pending',
      paymentDetails: {
        razorpay_payment_id: paymentMethod !== 'cod' ? razorpay_payment_id : null,
        razorpay_order_id: paymentMethod !== 'cod' ? razorpay_order_id : null,
        razorpay_signature: paymentMethod !== 'cod' ? razorpay_signature : null,
        status: paymentMethod !== 'cod' ? 'Paid' : 'Pending'
      }
    });

    await order.save();

    // Reward Loyalty Points & Deduct Used Points
    const pointsEarned = order.loyaltyPointsEarned;
    const pointsUsed = order.loyaltyPointsUsed;
    
    const userToUpdate = await User.findById(req.session.userId);
    if (userToUpdate) {
      if (pointsUsed > 0) {
        userToUpdate.loyaltyPoints -= pointsUsed;
        userToUpdate.loyaltyHistory.push({
          points: pointsUsed,
          reason: `Redeemed for Order #${order._id.toString().slice(-6).toUpperCase()}`,
          type: 'redeem'
        });
      }
      
      if (pointsEarned > 0) {
        userToUpdate.loyaltyPoints += pointsEarned;
        userToUpdate.loyaltyHistory.push({
          points: pointsEarned,
          reason: `Earned from Order #${order._id.toString().slice(-6).toUpperCase()}`,
          type: 'earn'
        });
      }
      await userToUpdate.save();
    }
 
    // Decrement stock for each item and check for low stock
    for (const item of cart.items) {
      const updatedProduct = await Product.findByIdAndUpdate(item.productId, {
        $inc: { countInStock: -item.quantity }
      }, { new: true });

      // Low Stock Alert (Pushed to background queue)
      if (updatedProduct && updatedProduct.countInStock <= 5) {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
        mailQueue.push({
          type: 'LOW_STOCK_ALERT',
          adminEmail: adminEmail,
          adminSubject: `⚠️ Low Stock Alert: ${updatedProduct.name}`,
          adminContent: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ffbd27; border-radius: 8px;">
            <h2 style="color: #d32f2f;">⚠️ Low Stock Alert</h2>
            <p>The following product is nearly out of stock and requires restocking:</p>
            <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Product:</strong> ${updatedProduct.name}</p>
              <p><strong>Current Inventory:</strong> <span style="color: #d32f2f; font-weight: bold;">${updatedProduct.countInStock} units remaining</span></p>
            </div>
          </div>`
        });
      }
    }


    // Clear cart after successful order
    cart.items = [];
    cart.appliedCoupon = null;
    cart.discountAmount = 0;
    cart.pointsUsed = 0;
    cart.pointsDiscount = 0;
    await cart.save();

    // TRIGGER: Automated Notifications (Offloaded to Job Queue)
    try {
      const user = await User.findById(req.session.userId);
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
      
      const userContent = user ? `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #088178; text-align: center;">Order Confirmed!</h2>
            <p>Hi ${user.username},</p>
            <p>Thank you for your order! We've received it and are preparing it for shipment.</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Summary</h3>
              <p><strong>Order ID:</strong> #${order._id.toString().slice(-6).toUpperCase()}</p>
              <p><strong>Total Amount:</strong> ₹${order.totalAmount.toLocaleString('en-IN')}</p>
            </div>
            <p>Our team is now busy packing your items.</p>
          </div>
      ` : null;

      const adminContent = `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #088178; border-radius: 10px;">
            <h2 style="color: #088178;">🔥 New Order Received!</h2>
            <p>A new order has been placed.</p>
            <div style="margin: 20px 0;">
              <p><strong>Order ID:</strong> #${order._id}</p>
              <p><strong>Customer:</strong> ${user?.username || 'Customer'}</p>
              <p><strong>Total Revenue:</strong> ₹${order.totalAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>
      `;

      // Instantly injects the task into memory to be handled asynchronously by fastq
      mailQueue.push({
        type: 'NEW_ORDER_EMAILS',
        userEmail: user?.email,
        userSubject: `🛍️ Order Confirmed: #${order._id.toString().slice(-6).toUpperCase()}`,
        userContent: userContent,
        adminEmail: adminEmail,
        adminSubject: `🔥 New Alert: Order #${order._id.toString().slice(-6).toUpperCase()} Received`,
        adminContent: adminContent
      });
      
    } catch (err) {
      console.error('Queue Dispatch Error:', err);
    }

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
      breadcrumbs: [
        { name: 'Order Success', url: `/order-success/${order._id}` }
      ]
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
      errorMsg,
      breadcrumbs: [{ name: 'Track Order', url: '/track-order' }]
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
  
      const settings = (await Settings.findOne()) || {
        address: "SSCCS Mumbai",
        phone: "+91 8160730726",
        email: "support@ecomsphere.com",
        logo: '/img/logo1.png'
      };
  
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      
      // Set Response Headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order._id.toString().slice(-6).toUpperCase()}.pdf`);
  
      doc.pipe(res);
  
      // --- HEADER & COLOR PALETTE ---
      const primaryColor = '#088178';
      const secondaryColor = '#1e293b';
      const textColor = '#334155';
      const lightBg = '#f8fafc';
      const borderColor = '#e2e8f0';
  
      // -- LOGO OR CO-NAME --
      // Attempt to load logo from disk if it starts with /
      let logoAdded = false;
      if (settings.logo && typeof settings.logo === 'string') {
        try {
          // Clean the logo path if it's a browser URL path
          const logoPath = path.join(__dirname, '../public', settings.logo.startsWith('/') ? settings.logo : '/' + settings.logo);
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 40, 35, { width: 45 });
            logoAdded = true;
          }
        } catch (e) { console.error('Logo loading failed:', e); }
      }
  
      if (!logoAdded) {
        doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('ECOMSPHERE', 40, 45);
        doc.fillColor(textColor).fontSize(9).font('Helvetica').text(settings.address || 'Global Headquarters', 40, 65, { width: 250 });
        doc.text(`${settings.phone} | ${settings.email}`, 40, 77);
      } else {
        doc.fillColor(primaryColor).fontSize(18).font('Helvetica-Bold').text('ECOMSPHERE', 95, 40);
        doc.fillColor(textColor).fontSize(9).font('Helvetica').text(settings.address || 'Global Headquarters', 95, 60, { width: 250 });
        doc.text(`${settings.phone} | ${settings.email}`, 95, 75);
      }
  
      // -- INVOICE BADGE --
      doc.rect(400, 35, 160, 70).fill(lightBg).stroke(borderColor);
      doc.fillColor(secondaryColor).fontSize(14).font('Helvetica-Bold').text('INVOICE', 415, 45);
      doc.fillColor(textColor).fontSize(9).font('Helvetica')
         .text(`Number: #INV-${order._id.toString().slice(-6).toUpperCase()}`, 415, 65)
         .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 415, 78)
         .text(`Status: ${order.status.toUpperCase()}`, 415, 91);
  
      doc.moveDown(4);
  
      // --- BILLING INFO ---
      const infoY = 140;
      doc.fillColor(secondaryColor).fontSize(10).font('Helvetica-Bold').text('BILL TO:', 40, infoY);
      doc.fillColor(textColor).font('Helvetica')
         .text(order.checkoutInfo.name, 40, infoY + 15)
         .text(order.checkoutInfo.address, 40, infoY + 30, { width: 250 })
         .text(`Phone: ${order.checkoutInfo.phone}`, 40, infoY + 60);
  
      doc.fillColor(secondaryColor).font('Helvetica-Bold').text('SHIP TO:', 320, infoY);
      doc.fillColor(textColor).font('Helvetica')
         .text(order.checkoutInfo.name, 320, infoY + 15)
         .text(order.checkoutInfo.address, 320, infoY + 30, { width: 230 })
         .text(`Phone: ${order.checkoutInfo.phone}`, 320, infoY + 60);
  
      // --- TABLE HEADER ---
      const tableTop = 260;
      doc.rect(40, tableTop, 520, 25).fill(secondaryColor);
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold');
      doc.text('ITEM DESCRIPTION', 50, tableTop + 8);
      doc.text('PRICE', 300, tableTop + 8, { width: 80, align: 'right' });
      doc.text('QTY', 390, tableTop + 8, { width: 60, align: 'right' });
      doc.text('TOTAL', 460, tableTop + 8, { width: 90, align: 'right' });
  
      // --- ITEMS ---
      let rowY = tableTop + 25;
      doc.fillColor(textColor).font('Helvetica');
      
      order.items.forEach((item, index) => {
        const itemPrice = item.price || 0;
        const itemQty = item.quantity || 1;
        const itemTotal = itemPrice * itemQty;
  
        // Zebra striping
        if (index % 2 === 0) {
          doc.rect(40, rowY, 520, 30).fill('#f1f5f9');
        }
        
        doc.fillColor(textColor);
        doc.text(item.name, 50, rowY + 10, { width: 240 });
        doc.text(`INR ${itemPrice.toLocaleString('en-IN')}`, 300, rowY + 10, { width: 80, align: 'right' });
        doc.text(itemQty.toString(), 390, rowY + 10, { width: 60, align: 'right' });
        doc.text(`INR ${itemTotal.toLocaleString('en-IN')}`, 460, rowY + 10, { width: 90, align: 'right' });
        
        rowY += 30;
  
        // Prevent overflow if items exceed page
        if (rowY > 700) {
          doc.addPage();
          rowY = 40; 
        }
      });
  
      // --- SUMMARY ---
      const summaryY = Math.min(rowY + 20, 700);
      
      // Bottom border for table
      doc.strokeColor(borderColor).lineWidth(1).moveTo(40, rowY).lineTo(560, rowY).stroke();
  
      doc.moveDown(2);
      
      doc.font('Helvetica-Bold').fontSize(10).text('SUBTOTAL', 380, summaryY + 10);
      doc.font('Helvetica').text(`INR ${order.subtotal.toLocaleString('en-IN')}`, 460, summaryY + 10, { align: 'right', width: 90 });
  
      let currentY = summaryY + 30;

      if (order.discount > 0) {
        doc.fillColor(primaryColor);
        doc.font('Helvetica-Bold').text('DISCOUNT (COUPON)', 380, currentY);
        doc.font('Helvetica').text(`- INR ${order.discount.toLocaleString('en-IN')}`, 460, currentY, { align: 'right', width: 90 });
        doc.fillColor(textColor);
        currentY += 20;
      }

      if (order.loyaltyPointsUsed > 0) {
        doc.fillColor(primaryColor);
        doc.font('Helvetica-Bold').text('POINTS USED', 380, currentY);
        doc.font('Helvetica').text(`- INR ${order.loyaltyPointsUsed.toLocaleString('en-IN')}`, 460, currentY, { align: 'right', width: 90 });
        doc.fillColor(textColor);
        currentY += 20;
      }

      if (order.taxAmount > 0) {
        doc.font('Helvetica-Bold').text('TAX (18% GST)', 380, currentY);
        doc.font('Helvetica').text(`+ INR ${order.taxAmount.toLocaleString('en-IN')}`, 460, currentY, { align: 'right', width: 90 });
        currentY += 20;
      }

      const shippingLabel = order.shippingFee > 0 ? `+ INR ${order.shippingFee.toLocaleString('en-IN')}` : 'FREE';
      doc.font('Helvetica-Bold').text('SHIPPING COST', 380, currentY);
      doc.font('Helvetica').text(shippingLabel, 460, currentY, { align: 'right', width: 90 });
      currentY += 20;
  
      // Grand Total Box
      doc.rect(360, currentY + 5, 200, 35).fill(primaryColor);
      doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold');
      doc.text('GRAND TOTAL', 375, currentY + 17);
      doc.text(`INR ${order.totalAmount.toLocaleString('en-IN')}`, 460, currentY + 17, { align: 'right', width: 90 });
  
      // --- FOOTER ---
      const paymentMode = order.paymentDetails && order.paymentDetails.razorpay_payment_id ? `Prepaid (Razorpay: ${order.paymentDetails.razorpay_payment_id})` : 'Cash on Delivery (COD)';
      doc.fillColor('#94a3b8').fontSize(9).font('Helvetica')
         .text(`Payment Mode: ${paymentMode}`, 40, 750)
         .text('Generated electronically by EcomSphere Billing System.', 40, 762);
  
      doc.fontSize(10).fillColor(primaryColor).font('Helvetica-Bold')
         .text('Thank you for choosing EcomSphere!', 40, 785, { align: 'center', width: 520 });
  
      doc.end();
    } catch (error) {
      console.error('Invoice error:', error);
      res.status(500).send('Error generating invoice');
    }
  };
 
 module.exports = {
   getCheckout,
   createRazorpayOrder,
   placeOrder,
   getOrderSuccess,
   getUserOrders,
   getTrackOrder,
   downloadInvoice,
 };

