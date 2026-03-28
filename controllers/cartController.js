const Cart = require('../models/Cart');
const Product = require('../models/Product');

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
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      total: parseFloat(total.toFixed(2)),
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
    const { productId, quantity = 1, size = null } = req.body;

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

    // Check if item already in cart with the same size
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.size === size
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: size,
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
};
