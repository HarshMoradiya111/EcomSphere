const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

const CATEGORIES = ['Men Clothing', 'Women Clothing', 'Footwear', 'Glasses', 'Cosmetics'];

// GET / - Homepage with products by category
const getHomepage = async (req, res) => {
  try {
    const productsByCategory = {};

    for (const category of CATEGORIES) {
      productsByCategory[category] = await Product.find({ category }).sort({ createdAt: -1 });
    }

    res.render('index', {
      title: 'EcomSphere - Shop Everything',
      productsByCategory,
      categories: CATEGORIES,
      user: req.session.username || null,
      success: req.flash('success'),
      errors: req.flash('error'),
    });
  } catch (error) {
    console.error('Homepage error:', error);
    res.render('index', {
      title: 'EcomSphere - Shop Everything',
      productsByCategory: {},
      categories: CATEGORIES,
      user: req.session.username || null,
      success: [],
      errors: ['Failed to load products'],
    });
  }
};

// GET /shop - Shop page with all products and category filter
const getShop = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category && CATEGORIES.includes(category)) {
      query.category = category;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.render('shop', {
      title: 'Shop - EcomSphere',
      products,
      categories: CATEGORIES,
      selectedCategory: category || '',
      user: req.session.username || null,
      success: req.flash('success'),
      errors: req.flash('error'),
    });
  } catch (error) {
    console.error('Shop error:', error);
    res.render('shop', {
      title: 'Shop - EcomSphere',
      products: [],
      categories: CATEGORIES,
      selectedCategory: '',
      user: req.session.username || null,
      success: [],
      errors: ['Failed to load products'],
    });
  }
};

// GET /product/:id - Single product page
const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/shop');
    }

    // Get related products from same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    res.render('sproduct', {
      title: `${product.name} - EcomSphere`,
      product,
      relatedProducts,
      user: req.session.username || null,
      success: req.flash('success'),
      errors: req.flash('error'),
    });
  } catch (error) {
    console.error('Single product error:', error);
    req.flash('error', 'Product not found');
    res.redirect('/shop');
  }
};

// GET /profile - User profile and order history
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    const orders = await Order.find({ userId: req.session.userId }).sort({ createdAt: -1 });

    res.render('profile', {
      title: 'My Profile - EcomSphere',
      user,
      orders,
      success: req.flash('success'),
      errors: req.flash('error'),
    });
  } catch (error) {
    console.error('Profile error:', error);
    req.flash('error', 'Failed to load profile');
    res.redirect('/');
  }
};

// POST /profile/photo - User profile photo upload
const postProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/profile');
    }

    if (!req.file) {
      req.flash('error', 'Please select a valid image file');
      return res.redirect('/profile');
    }

    // Delete old profile photo if it exists and is custom
    if (user.profilePhoto && !user.profilePhoto.startsWith('/img/rprofile/')) {
      const p = path.join(__dirname, '../public', user.profilePhoto);
      if (fs.existsSync(p)) fs.unlink(p, () => {});
    }

    user.profilePhoto = '/uploads/' + req.file.filename;
    await user.save();

    req.flash('success', 'Profile photo updated successfully!');
    res.redirect('/profile');
  } catch (error) {
    console.error('Profile photo upload error:', error);
    req.flash('error', 'Failed to update profile photo');
    res.redirect('/profile');
  }
};

module.exports = {
  getHomepage,
  getShop,
  getSingleProduct,
  getProfile,
  postProfilePhoto,
};
