const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// GET /api/cart - Fetch user's cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.session.userId });

    if (!cart || cart.items.length === 0) {
      return res.json({ success: true, cart: [], total: 0 });
    }

    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return res.json({
      success: true,
      cart: cart.items.map((item) => ({
        id: item._id.toString(),
        productId: item.productId.toString(),
        name: item.name,
        price: item.price,
        image: item.image,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      appliedCoupon: cart.appliedCoupon,
      discountAmount: cart.discountAmount || 0,
      total: parseFloat((total - (cart.discountAmount || 0)).toFixed(2)),
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch cart' });
  }
};

// GET /cart - Cart page (view)
const getCartPage = (req, res) => {
  res.render('cart', {
    title: 'Shopping Cart - EcomSphere',
    user: req.session.username || null,
    success: req.flash('success'),
    errors: req.flash('error'),
  });
};

// POST /api/cart/add - Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size = null, color = null } = req.body;
 
    if (!productId) {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }
 
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
 
    let cart = await Cart.findOne({ userId: req.session.userId });
 
    if (!cart) {
      cart = new Cart({ userId: req.session.userId, items: [] });
    }
 
    // Stock Validation
    const requestedQty = parseInt(quantity);
    if (product.countInStock < requestedQty) {
      return res.status(400).json({ success: false, error: `Only ${product.countInStock} items available in stock` });
    }

 
    // Check if item already in cart with the same size and color
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.size === size && item.color === color
    );
 
    if (existingItemIndex > -1) {
      const newTotalQty = cart.items[existingItemIndex].quantity + requestedQty;
      if (product.countInStock < newTotalQty) {
        return res.status(400).json({ success: false, error: `Maximum available stock reached (${product.countInStock})` });
      }
      cart.items[existingItemIndex].quantity = newTotalQty;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: size,
        color: color,
        quantity: parseInt(quantity),
      });
    }

    await cart.save();

    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return res.json({
      success: true,
      message: 'Item added to cart',
      cartCount: cart.items.reduce((count, item) => count + item.quantity, 0),
      total: parseFloat(total.toFixed(2)),
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add item to cart' });
  }
};

// POST /api/cart/update - Update cart item quantity
const updateCart = async (req, res) => {
  try {
    const { itemId, action } = req.body;

    const cart = await Cart.findOne({ userId: req.session.userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Item not found in cart' });
    }

    if (action === 'increase') {
      const product = await Product.findById(cart.items[itemIndex].productId);
      if (product && cart.items[itemIndex].quantity + 1 > product.countInStock) {
        return res.status(400).json({ success: false, error: `Only ${product.countInStock} items available in stock` });
      }
      cart.items[itemIndex].quantity += 1;
    } else if (action === 'decrease') {
      cart.items[itemIndex].quantity -= 1;
      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    }

    await cart.save();

    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return res.json({
      success: true,
      message: 'Cart updated',
      total: parseFloat(total.toFixed(2)),
    });
  } catch (error) {
    console.error('Update cart error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update cart' });
  }
};

// POST /api/cart/remove - Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.body;

    const cart = await Cart.findOne({ userId: req.session.userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return res.json({
      success: true,
      message: 'Item removed from cart',
      total: parseFloat(total.toFixed(2)),
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return res.status(500).json({ success: false, error: 'Failed to remove item from cart' });
  }
};

module.exports = {
  getCart,
  getCartPage,
  addToCart,
  updateCart,
  removeFromCart,
  applyCoupon,
  removeCoupon,
};
 
 async function applyCoupon(req, res) {
   try {
     const { couponCode } = req.body;
     const cart = await Cart.findOne({ userId: req.session.userId });
 
     if (!cart || cart.items.length === 0) {
       return res.status(400).json({ success: false, error: 'Your cart is empty' });
     }
 
     const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
     if (!coupon) {
       return res.status(404).json({ success: false, error: 'Invalid coupon code' });
     }
 
     const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
     const validation = coupon.isValid(total);
     if (!validation.valid) {
       return res.status(400).json({ success: false, error: validation.message });
     }
 
     const discount = coupon.calculateDiscount(total);
     cart.appliedCoupon = coupon.code;
     cart.discountAmount = discount;
     await cart.save();
 
     return res.json({ 
       success: true, 
       message: 'Coupon applied!', 
       discountAmount: discount,
       total: parseFloat((total - discount).toFixed(2)) 
     });
   } catch (error) {
     console.error('Apply coupon error:', error);
     return res.status(500).json({ success: false, error: 'Failed to apply coupon' });
   }
 }
 
 async function removeCoupon(req, res) {
   try {
     const cart = await Cart.findOne({ userId: req.session.userId });
     if (!cart) return res.status(404).json({ success: false, error: 'Cart not found' });
 
     cart.appliedCoupon = null;
     cart.discountAmount = 0;
     await cart.save();
     
     const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
     return res.json({ success: true, message: 'Coupon removed', total });
   } catch (error) {
     console.error('Remove coupon error:', error);
     return res.status(500).json({ success: false, error: 'Failed to remove coupon' });
   }
 }
