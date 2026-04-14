const Product = require('../models/Product');
const Blog = require('../models/Blog');
const Order = require('../models/Order');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const HeroBanner = require('../models/HeroBanner');
const FlashSale = require('../models/FlashSale');
const Newsletter = require('../models/Newsletter');
const FAQ = require('../models/FAQ');
const SearchAnalytics = require('../models/SearchAnalytics');
const { dbCache } = require('../utils/cacheManager');

const CATEGORIES = ['Men Clothing', 'Women Clothing', 'Footwear', 'Glasses', 'Cosmetics'];

// GET / - Homepage with products by category
const getHomepage = async (req, res) => {
  try {
    let rawProductsByCategory = await dbCache.get('home_products');
    let banners = await dbCache.get('home_banners');
    let flashSale = await dbCache.get('home_flashSale');

    // 1. REDIS-STYLE CACHING
    // If not in RAM, query the Database and save it to Cache
    if (!rawProductsByCategory) {
      rawProductsByCategory = {};
      for (const category of CATEGORIES) {
        rawProductsByCategory[category] = await Product.find({ category }).sort({ createdAt: -1 }).lean();
      }
      await dbCache.set('home_products', rawProductsByCategory);
    }

    if (!banners) {
      banners = await HeroBanner.find({ isActive: true }).sort({ createdAt: -1 }).lean();
      await dbCache.set('home_banners', banners);
    }

    if (!flashSale) {
      flashSale = await FlashSale.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
      await dbCache.set('home_flashSale', flashSale);
    }

    // Deep clone to avoid mutating the cached object for specific users
    let productsByCategory = JSON.parse(JSON.stringify(rawProductsByCategory));

    // Mark items in wishlist if logged in
    let wishlistIds = [];
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user) wishlistIds = user.wishlist.map(id => id.toString());
    }

    // Apply specific user wishlist bindings to the cached data
    if (wishlistIds.length > 0) {
      for (const category of CATEGORIES) {
        productsByCategory[category] = productsByCategory[category].map(p => {
          p.isInWishlist = wishlistIds.includes(p._id.toString());
          return p;
        });
      }
    }

    res.render('index', {
      title: 'EcomSphere - Shop Everything',
      productsByCategory,
      categories: CATEGORIES,
      user: req.session.username || null,
      banners,
      flashSale,
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
    const { category, search, minPrice, maxPrice, sortBy } = req.query;
    let query = {};

    if (category && CATEGORIES.includes(category)) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // --- PRICE FILTERING ---
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // --- SORTING ---
    let sortOption = { createdAt: -1 }; // Default: Newest
    if (sortBy) {
      switch (sortBy) {
        case 'price-low': sortOption = { price: 1 }; break;
        case 'price-high': sortOption = { price: -1 }; break;
        case 'oldest': sortOption = { createdAt: 1 }; break;
        case 'newest': sortOption = { createdAt: -1 }; break;
      }
    }

    let products = await Product.find(query).sort(sortOption);

    // Get Min/Max prices for the slider bounds
    const allPrices = await Product.find({}, { price: 1 });
    const minPossible = allPrices.length > 0 ? Math.min(...allPrices.map(p => p.price)) : 0;
    const maxPossible = allPrices.length > 0 ? Math.max(...allPrices.map(p => p.price)) : 10000;

    // Mark items in wishlist if logged in
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user) {
        const wishlistIds = user.wishlist.map(id => id.toString());
        products = products.map(p => {
          const productObj = p.toObject();
          productObj.isInWishlist = wishlistIds.includes(p._id.toString());
          return productObj;
        });
      }
    }

    let breadcrumbs = [{ name: 'Shop', url: '/shop' }];
    if (category) {
      breadcrumbs.push({ name: category, url: `/shop?category=${category}` });
    }

    res.render('shop', {
      title: 'Shop - EcomSphere',
      products,
      categories: CATEGORIES,
      selectedCategory: category || '',
      search: search || '',
      minPrice: minPrice || minPossible,
      maxPrice: maxPrice || maxPossible,
      minPossible,
      maxPossible,
      sortBy: sortBy || 'newest',
      user: req.session.username || null,
      sessionUserId: req.session.userId || null,
      success: req.flash('success'),
      errors: req.flash('error'),
      breadcrumbs
    });
  } catch (error) {
    console.error('Shop error:', error);
    res.render('shop', {
      title: 'Shop - EcomSphere',
      products: [],
      categories: CATEGORIES,
      selectedCategory: '',
      search: '',
      user: req.session.username || null,
      success: [],
      errors: ['Failed to load products'],
      breadcrumbs: [{ name: 'Shop', url: '/shop' }]
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

    const breadcrumbs = [
      { name: 'Shop', url: '/shop' },
      { name: product.category, url: `/shop?category=${product.category}` },
      { name: product.name, url: `/product/${product._id}` }
    ];

    res.render('sproduct', {
      title: `${product.name} - EcomSphere`,
      product,
      relatedProducts,
      user: req.session.username || null,
      success: req.flash('success'),
      errors: req.flash('error'),
      breadcrumbs
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
      breadcrumbs: [{ name: 'My Profile', url: '/profile' }]
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
      if (fs.existsSync(p)) fs.unlink(p, () => { });
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

// POST /profile/update - Update personal info
const postUpdateProfile = async (req, res) => {
  try {
    const { username, email, phone } = req.body;
    const user = await User.findById(req.session.userId);

    if (username) user.username = username.trim();
    if (email) user.email = email.trim();
    if (phone) user.phone = phone.trim();

    await user.save();

    // Update session if username changed
    req.session.username = user.username;

    req.flash('success', 'Profile updated successfully!');
    res.redirect('/profile');
  } catch (error) {
    console.error('Update profile error:', error);
    req.flash('error', error.code === 11000 ? 'Username or Email already exists' : 'Failed to update profile');
    res.redirect('/profile');
  }
};

// POST /profile/address/add - Add new address
const postAddAddress = async (req, res) => {
  try {
    const { street, city, state, zip, country, isDefault } = req.body;
    const user = await User.findById(req.session.userId);

    const newAddress = {
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      country: country ? country.trim() : 'India',
      isDefault: isDefault === 'on' || isDefault === true,
    };

    // If making this default, unset other defaults
    if (newAddress.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    } else if (user.addresses.length === 0) {
      newAddress.isDefault = true; // First address is default
    }

    user.addresses.push(newAddress);
    await user.save();

    req.flash('success', 'Address added successfully!');
    res.redirect('/profile');
  } catch (error) {
    console.error('Add address error:', error);
    req.flash('error', 'Failed to add address');
    res.redirect('/profile');
  }
};

// POST /profile/address/delete/:index - Delete an address
const postDeleteAddress = async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const user = await User.findById(req.session.userId);

    if (index >= 0 && index < user.addresses.length) {
      const removed = user.addresses.splice(index, 1)[0];

      // If we removed the default, set a new one if possible
      if (removed.isDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
      }

      await user.save();
      req.flash('success', 'Address deleted successfully!');
    }

    res.redirect('/profile');
  } catch (error) {
    console.error('Delete address error:', error);
    req.flash('error', 'Failed to delete address');
    res.redirect('/profile');
  }
};

// GET /blog
const getBlogPage = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 });
    res.render('blog', {
      title: 'Blog - EcomSphere',
      blogs,
      user: req.session.username || null,
      errors: req.flash('error'),
      success: req.flash('success'),
      breadcrumbs: [{ name: 'Blog', url: '/blog' }]
    });
  } catch (e) {
    res.render('blog', { title: 'Blog', blogs: [], user: null, errors: [], success: [] });
  }
};

// POST /api/product/review - Add a product review
const postAddReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Please login to leave a review' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.userId.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this product' });
    }

    const user = await User.findById(userId);

    const newReview = {
      userId,
      username: user.username,
      userPhoto: user.profilePhoto,
      rating: Number(rating),
      comment: comment.trim(),
    };

    product.reviews.push(newReview);
    await product.save();

    res.json({
      success: true,
      message: 'Review added successfully!',
      averageRating: product.averageRating,
      numReviews: product.numReviews,
      review: {
        ...newReview,
        createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
};

// GET /api/products/search - Live search API
const getSearchApi = async (req, res) => {
  try {
    const qVal = req.query.q || '';
    if (qVal.length < 2) {
      return res.json({ success: true, products: [] });
    }

    // Use exact same query logic as getShop
    const products = await Product.find({
      $or: [
        { name: { $regex: qVal, $options: 'i' } },
        { description: { $regex: qVal, $options: 'i' } }
      ]
    }).limit(10);

    // ANALYTICS: Log search event asynchronously
    SearchAnalytics.create({
      query: qVal,
      userId: req.session.userId || null,
      resultsCount: products.length,
      timestamp: new Date()
    }).catch(err => console.error('Search logging failed:', err));

    res.json({ success: true, products });
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ success: false, error: 'Failed to search' });
  }
};

// POST /subscribe-newsletter
const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      req.flash('error', 'Please provide an email address');
      return res.redirect(req.get('referer') || '/');
    }

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      req.flash('error', 'You are already subscribed!');
      return res.redirect(req.get('referer') || '/');
    }

    await Newsletter.create({ email });
    req.flash('success', 'Thank you for subscribing to our newsletter!');
    res.redirect(req.get('referer') || '/');
  } catch (error) {
    console.error('Newsletter error:', error);
    req.flash('error', 'Subscription failed. Please try again.');
    res.redirect(req.get('referer') || '/');
  }
};

// GET /faq
const getFAQPage = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ category: 1, order: 1 });
    // Group FAQs by category
    const groupedFAQs = faqs.reduce((acc, faq) => {
      if (!acc[faq.category]) acc[faq.category] = [];
      acc[faq.category].push(faq);
      return acc;
    }, {});

    res.render('faq', {
      title: 'Frequently Asked Questions - EcomSphere',
      user: req.session.username || null,
      groupedFAQs,
      breadcrumbs: [{ name: 'FAQ', url: '/faq' }]
    });
  } catch (error) {
    console.error('FAQ page error:', error);
    res.redirect('/');
  }
};

// GET /compare?ids=id1,id2...
const getComparePage = async (req, res) => {
  try {
    const { ids } = req.query;
    let products = [];
    if (ids) {
      const productIdsArray = ids.split(',').filter(id => id.length > 0);
      products = await Product.find({ _id: { $in: productIdsArray } });
    }

    res.render('compare', {
      title: 'Compare Products - EcomSphere',
      products,
      user: req.session.username || null,
      breadcrumbs: [{ name: 'Compare', url: '/compare' }]
    });
  } catch (error) {
    console.error('Compare error:', error);
    res.redirect('/shop');
  }
};

module.exports = {
  getHomepage,
  getShop,
  getSingleProduct,
  getProfile,
  postProfilePhoto,
  getBlogPage,
  postAddReview,
  postUpdateProfile,
  postAddAddress,
  postDeleteAddress,
  getSearchApi,
  subscribeNewsletter,
  getFAQPage,
  getComparePage,
};
