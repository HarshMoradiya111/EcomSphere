const User = require('../models/User');
const Product = require('../models/Product');

// GET /wishlist - Render wishlist page
const getWishlistPage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('wishlist');
    
    res.render('wishlist', {
      title: 'My Wishlist - EcomSphere',
      wishlist: user ? user.wishlist : [],
      user: req.session.username || null,
      success: req.flash('success'),
      errors: req.flash('error'),
    });
  } catch (error) {
    console.error('Wishlist page error:', error);
    req.flash('error', 'Failed to load wishlist');
    res.redirect('/');
  }
};

// POST /api/wishlist/toggle - Toggle product in wishlist
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const index = user.wishlist.indexOf(productId);
    let action = '';

    if (index > -1) {
      user.wishlist.splice(index, 1);
      action = 'removed';
    } else {
      user.wishlist.push(productId);
      action = 'added';
    }

    await user.save();

    res.json({ success: true, action, wishlistCount: user.wishlist.length });
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({ success: false, error: 'Failed to update wishlist' });
  }
};

module.exports = {
  getWishlistPage,
  toggleWishlist,
};
