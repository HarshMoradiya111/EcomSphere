const Admin = require('../models/Admin');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Blog = require('../models/Blog');
const Settings = require('../models/Settings');
const Coupon = require('../models/Coupon');
const HeroBanner = require('../models/HeroBanner');
const FlashSale = require('../models/FlashSale');
const Newsletter = require('../models/Newsletter');
const FAQ = require('../models/FAQ');
const SearchAnalytics = require('../models/SearchAnalytics');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const CATEGORIES = ['Men Clothing', 'Women Clothing', 'Footwear', 'Glasses', 'Cosmetics'];

// GET /admin/login
const getAdminLogin = (req, res) => {
  res.render('admin/login', {
    title: 'Admin Login - EcomSphere',
    errors: req.flash('error'),
    success: req.flash('success'),
  });
};

// POST /admin/login
const postAdminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      req.flash('error', 'Username and password are required');
      return res.redirect('/admin/login');
    }

    const admin = await Admin.findOne({ username: username.trim() });

    if (!admin || !(await admin.comparePassword(password))) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/admin/login');
    }

    req.session.adminId = admin._id.toString();
    req.session.adminUsername = admin.username;

    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Admin login error:', error);
    req.flash('error', 'Login failed. Please try again.');
    res.redirect('/admin/login');
  }
};

// GET /admin/logout
const adminLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.redirect('/admin/login');
  });
};

// GET /admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [productCount, userCount, orderCount, products, lowStockProducts] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Product.find().sort({ createdAt: -1 }),
      Product.find({ countInStock: { $lte: 5 } }).sort({ countInStock: 1 }),
    ]);
    const lowStockCount = lowStockProducts.length;

    const recentOrders = await Order.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Sales Analytics: Daily Revenue (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Sales Analytics: Category Distribution (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Efficiently get category sales by joining with Products
    const categorySales = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'Cancelled' } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          totalSold: { $sum: "$items.quantity" }
        }
      }
    ]);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard - EcomSphere',
      adminUsername: req.session.adminUsername,
      products,
      productCount,
      userCount,
      orderCount,
      recentOrders,
      dailyRevenue,
      categorySales,
      lowStockCount,
      lowStockProducts,
      errors: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error', 'Failed to load dashboard');
    res.redirect('/admin/login');
  }
};

// GET /admin/products
const getProducts = async (req, res) => {
  try {
    const { category, sort } = req.query;

    // Filter logic
    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Sort logic
    let sortQuery = { createdAt: -1 }; // Default: Newest first
    if (sort === 'oldest') sortQuery = { createdAt: 1 };
    else if (sort === 'price_asc') sortQuery = { price: 1 };
    else if (sort === 'price_desc') sortQuery = { price: -1 };
    else if (sort === 'name_asc') sortQuery = { name: 1 };
    else if (sort === 'name_desc') sortQuery = { name: -1 };

    const products = await Product.find(filter).sort(sortQuery);

    res.render('admin/products', {
      title: 'Products - Admin',
      adminUsername: req.session.adminUsername,
      products,
      categories: CATEGORIES,
      selectedCategory: category || 'All',
      selectedSort: sort || 'newest',
      errors: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (error) {
    console.error('Admin products error:', error);
    req.flash('error', 'Failed to load products');
    res.redirect('/admin/dashboard');
  }
};

// GET /admin/products/add
const getAddProduct = (req, res) => {
  res.render('admin/add_product', {
    title: 'Add Product - Admin',
    adminUsername: req.session.adminUsername,
    categories: CATEGORIES,
    errors: req.flash('error'),
    success: req.flash('success'),
  });
};

// POST /admin/products/add
const postAddProduct = async (req, res) => {
  try {
    const { name, description, price, category, sizes: sizesStr, colors: colorsStr, countInStock } = req.body;
 
    if (!name || !description || !price || !category) {
      req.flash('error', 'All fields are required');
      return res.redirect('/admin/products/add');
    }
 
    if (!req.files || !req.files.image || req.files.image.length === 0) {
      req.flash('error', 'Main product image is required');
      return res.redirect('/admin/products/add');
    }
 
    const sizes = sizesStr ? sizesStr.split(',').map(s => s.trim()).filter(s => s !== '') : [];
    const colors = colorsStr ? colorsStr.split(',').map(c => c.trim()).filter(c => c !== '') : [];
 
    const mainImage = req.files.image[0].filename;
    const additionalImages = req.files.additionalImages ? req.files.additionalImages.map(f => f.filename) : [];
 
    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      image: mainImage,
      additionalImages: additionalImages,
      sizes,
      colors,
      countInStock: parseInt(countInStock) || 0,
    });

    await product.save();

    req.flash('success', 'Product added successfully!');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Add product error:', error);
    // Remove uploaded file if product save fails
    if (req.files) {
      if (req.files.image) fs.unlink(req.files.image[0].path, () => {});
      if (req.files.additionalImages) req.files.additionalImages.forEach(f => fs.unlink(f.path, () => {}));
    }
    req.flash('error', 'Failed to add product. Please try again.');
    res.redirect('/admin/products/add');
  }
};

// GET /admin/products/edit/:id
const getEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/admin/products');
    }

    res.render('admin/edit_product', {
      title: 'Edit Product - Admin',
      adminUsername: req.session.adminUsername,
      product,
      categories: CATEGORIES,
      errors: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (error) {
    console.error('Get edit product error:', error);
    req.flash('error', 'Failed to load product');
    res.redirect('/admin/products');
  }
};

// POST /admin/products/edit/:id
const postEditProduct = async (req, res) => {
  try {
    const { name, description, price, category, sizes: sizesStr, colors: colorsStr, countInStock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/admin/products');
    }

    // If new image uploaded, delete old one
    if (req.files && req.files.image && req.files.image.length > 0) {
      const oldImagePath = path.join(__dirname, '../public/uploads', product.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, () => {});
      }
      product.image = req.files.image[0].filename;
    }

    // Add new additional images
    if (req.files && req.files.additionalImages && req.files.additionalImages.length > 0) {
      const newAdditionalImages = req.files.additionalImages.map(f => f.filename);
      product.additionalImages = product.additionalImages.concat(newAdditionalImages);
    }

    product.name = name ? name.trim() : product.name;
    product.description = description ? description.trim() : product.description;
    product.price = price ? parseFloat(price) : product.price;
    product.category = category || product.category;
 
    product.sizes = sizesStr ? sizesStr.split(',').map(s => s.trim()).filter(s => s !== '') : [];
    product.colors = colorsStr ? colorsStr.split(',').map(c => c.trim()).filter(c => c !== '') : [];
    product.countInStock = countInStock ? parseInt(countInStock) : product.countInStock;
 
    await product.save();

    req.flash('success', 'Product updated successfully!');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Edit product error:', error);
    req.flash('error', 'Failed to update product');
    res.redirect(`/admin/products/edit/${req.params.id}`);
  }
};

// POST /admin/products/delete/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/admin/products');
    }

    // Delete image file
    const imagePath = path.join(__dirname, '../public/uploads', product.image);
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, () => {});
    }

    // Delete additional images
    if (product.additionalImages && product.additionalImages.length > 0) {
      product.additionalImages.forEach(img => {
        const imgPath = path.join(__dirname, '../public/uploads', img);
        if (fs.existsSync(imgPath)) {
          fs.unlink(imgPath, () => {});
        }
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    req.flash('success', 'Product deleted successfully!');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Delete product error:', error);
    req.flash('error', 'Failed to delete product');
    res.redirect('/admin/products');
  }
};

// GET /admin/orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    res.render('admin/orders', {
      title: 'Orders - Admin',
      adminUsername: req.session.adminUsername,
      orders,
      errors: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (error) {
    console.error('Admin orders error:', error);
    req.flash('error', 'Failed to load orders');
    res.redirect('/admin/dashboard');
  }
};

// GET /admin/orders/:id
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'username email');

    if (!order) {
      req.flash('error', 'Order not found');
      return res.redirect('/admin/orders');
    }

    res.render('admin/order_details', {
      title: `Order #${order._id} - Admin`,
      adminUsername: req.session.adminUsername,
      order,
      errors: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (error) {
    console.error('Order details error:', error);
    req.flash('error', 'Failed to load order');
    res.redirect('/admin/orders');
  }
};

// POST /admin/orders/:id/status - Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      req.flash('error', 'Invalid status');
      return res.redirect(`/admin/orders/${req.params.id}`);
    }

    await Order.findByIdAndUpdate(req.params.id, { status });

    req.flash('success', `Order status updated to ${status}`);
    res.redirect(`/admin/orders/${req.params.id}`);
  } catch (error) {
    console.error('Update order status error:', error);
    req.flash('error', 'Failed to update order status');
    res.redirect('/admin/orders');
  }
};

// POST /admin/orders/:id/delete - Delete order
const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    req.flash('success', 'Order deleted successfully');
    res.redirect('/admin/orders');
  } catch (error) {
    console.error('Delete order error:', error);
    req.flash('error', 'Failed to delete order');
    res.redirect('/admin/orders');
  }
};

// GET /admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.render('admin/users', {
      title: 'Users - Admin',
      adminUsername: req.session.adminUsername,
      users,
      errors: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (error) {
    console.error('Admin users error:', error);
    req.flash('error', 'Failed to load users');
    res.redirect('/admin/dashboard');
  }
};

// POST /admin/users/:id/delete
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success', 'User deleted successfully');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Delete user error:', error);
    req.flash('error', 'Failed to delete user');
    res.redirect('/admin/users');
  }
};

const getSettings = async (req, res) => {
  const settings = await Settings.findOne() || await Settings.create({});
  res.render('admin/settings', { title: 'Settings', settings, activePage: 'settings' });
};

const updateSettings = async (req, res) => {
  const { address, phone, hours, email } = req.body;
  const settings = await Settings.findOne() || await Settings.create({});
  settings.address = address;
  settings.phone = phone;
  settings.hours = hours;
  settings.email = email;
  if (req.file) settings.logo = '/uploads/' + req.file.filename;
  await settings.save();
  res.redirect('/admin/settings');
};

const getBlogs = async (req, res) => {
  const blogs = await Blog.find();
  res.render('admin/blogs', { title: 'Blogs', blogs, activePage: 'blogs' });
};

const addBlogForm = (req, res) => res.render('admin/add_blog', { title: 'Add Blog', activePage: 'blogs' });

const addBlog = async (req, res) => {
  await Blog.create({ title: req.body.title, content: req.body.content, image: '/uploads/' + req.file.filename });
  res.redirect('/admin/blogs');
};

const editBlogForm = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.render('admin/edit_blog', { title: 'Edit Blog', blog, activePage: 'blogs' });
};

const updateBlog = async (req, res) => {
  const updateQuery = { title: req.body.title, content: req.body.content };
  if (req.file) updateQuery.image = '/uploads/' + req.file.filename;
  await Blog.findByIdAndUpdate(req.params.id, updateQuery);
  res.redirect('/admin/blogs');
};

const deleteBlog = async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.redirect('/admin/blogs');
};

// MARKETING TOOLS

// GET /admin/marketing
const getMarketing = async (req, res) => {
  try {
    const [banners, flashSales, subscribers] = await Promise.all([
      HeroBanner.find().sort({ createdAt: -1 }),
      FlashSale.find().sort({ createdAt: -1 }),
      Newsletter.find().sort({ subscribedAt: -1 })
    ]);

    res.render('admin/marketing', {
      title: 'Marketing Tools - EcomSphere',
      adminUsername: req.session.adminUsername,
      banners,
      flashSales,
      subscribers,
      errors: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (error) {
    console.error('Marketing tools error:', error);
    req.flash('error', 'Failed to load marketing tools');
    res.redirect('/admin/dashboard');
  }
};

// POST /admin/marketing/banner
const postAddBanner = async (req, res) => {
  try {
    const { title, subtitle, buttonText, buttonLink } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!image) {
      req.flash('error', 'Banner image is required');
      return res.redirect('/admin/marketing');
    }

    await HeroBanner.create({ title, subtitle, buttonText, buttonLink, image });
    req.flash('success', 'Banner added successfully');
    res.redirect('/admin/marketing');
  } catch (error) {
    console.error('Add banner error:', error);
    req.flash('error', 'Failed to add banner');
    res.redirect('/admin/marketing');
  }
};

// POST /admin/marketing/banner/delete/:id
const deleteBanner = async (req, res) => {
  try {
    await HeroBanner.findByIdAndDelete(req.params.id);
    req.flash('success', 'Banner deleted successfully');
    res.redirect('/admin/marketing');
  } catch (error) {
    req.flash('error', 'Failed to delete banner');
    res.redirect('/admin/marketing');
  }
};

// POST /admin/marketing/flash-sale
const postUpdateFlashSale = async (req, res) => {
  try {
    const { title, discountText, endTime, isActive } = req.body;
    
    // For simplicity, we only allow one active flash sale for now or just manage them and select latest active on frontend.
    // Let's just create a new one and mark others inactive or just use one.
    // Let's just use what's sent.
    await FlashSale.create({ 
      title, 
      discountText, 
      endTime: new Date(endTime),
      isActive: isActive === 'on'
    });

    req.flash('success', 'Flash sale updated');
    res.redirect('/admin/marketing');
  } catch (error) {
    console.error('Flash sale error:', error);
    req.flash('error', 'Failed to update flash sale');
    res.redirect('/admin/marketing');
  }
};

// POST /admin/marketing/subscribers/delete/:id
const deleteSubscriber = async (req, res) => {
  try {
    await Newsletter.findByIdAndDelete(req.params.id);
    req.flash('success', 'Subscriber removed');
    res.redirect('/admin/marketing');
  } catch (error) {
    req.flash('error', 'Failed to remove subscriber');
    res.redirect('/admin/marketing');
  }
};

// INVENTORY MANAGEMENT

// GET /admin/inventory
const getInventory = async (req, res) => {
  try {
    const products = await Product.find().sort({ countInStock: 1 });
    
    res.render('admin/inventory', {
      title: 'Inventory Management - EcomSphere',
      adminUsername: req.session.adminUsername,
      products,
      errors: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (error) {
    console.error('Inventory load error:', error);
    req.flash('error', 'Failed to load inventory');
    res.redirect('/admin/dashboard');
  }
};

// POST /admin/inventory/update-stock/:id
const postUpdateStock = async (req, res) => {
  try {
    const { countInStock } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.countInStock = parseInt(countInStock);
    await product.save();

    // If AJAX request
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({ 
        success: true, 
        message: 'Stock updated', 
        newStatus: product.status,
        newStock: product.countInStock 
      });
    }

    req.flash('success', `${product.name} stock updated successfully`);
    res.redirect('/admin/inventory');
  } catch (error) {
    console.error('Update stock error:', error);
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ success: false, message: 'Failed to update stock' });
    }
    req.flash('error', 'Failed to update stock');
    res.redirect('/admin/inventory');
  }
};

// FAQ MANAGEMENT

// GET /admin/search-analytics
const getSearchAnalytics = async (req, res) => {
  try {
    // 1. Top 10 Searched Terms (Aggregate)
    const topSearches = await SearchAnalytics.aggregate([
      {
        $group: {
          _id: '$query',
          count: { $sum: 1 },
          avgResults: { $avg: '$resultsCount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 2. Terms with Zero Results (Potential Inventory Gaps)
    const zeroResultsQueries = await SearchAnalytics.aggregate([
      { $match: { resultsCount: 0 } },
      {
        $group: {
          _id: '$query',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 3. Overall Activity (Last 30 queries)
    const recentQueries = await SearchAnalytics.find().sort({ timestamp: -1 }).limit(30);

    res.render('admin/search_analytics', {
      title: 'Search Analytics - EcomSphere',
      adminUsername: req.session.adminUsername,
      topSearches,
      zeroResultsQueries,
      recentQueries,
      errors: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (error) {
    console.error('Search analytics error:', error);
    req.flash('error', 'Failed to load search analytics');
    res.redirect('/admin/dashboard');
  }
};

// GET /admin/faqs
const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ category: 1, order: 1 });
    res.render('admin/faqs', {
      title: 'FAQ Management - EcomSphere',
      adminUsername: req.session.adminUsername,
      faqs,
      errors: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (error) {
    req.flash('error', 'Failed to load FAQs');
    res.redirect('/admin/dashboard');
  }
};

// POST /admin/faqs/add
const postAddFAQ = async (req, res) => {
  try {
    const { question, answer, category, order } = req.body;
    await FAQ.create({ question, answer, category, order: parseInt(order) || 0 });
    req.flash('success', 'FAQ added successfully');
    res.redirect('/admin/faqs');
  } catch (error) {
    req.flash('error', 'Failed to add FAQ');
    res.redirect('/admin/faqs');
  }
};

// GET /admin/faqs/edit/:id
const getEditFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      req.flash('error', 'FAQ not found');
      return res.redirect('/admin/faqs');
    }
    res.render('admin/faq_edit', {
      title: 'Edit FAQ - EcomSphere',
      adminUsername: req.session.adminUsername,
      faq,
      errors: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (error) {
    req.flash('error', 'Could not open edit form');
    res.redirect('/admin/faqs');
  }
};

// POST /admin/faqs/edit/:id
const postUpdateFAQ = async (req, res) => {
  try {
    const { question, answer, category, order } = req.body;
    await FAQ.findByIdAndUpdate(req.params.id, {
      question,
      answer,
      category,
      order: parseInt(order) || 0
    });
    req.flash('success', 'FAQ updated successfully');
    res.redirect('/admin/faqs');
  } catch (error) {
    req.flash('error', 'Failed to update FAQ');
    res.redirect('/admin/faqs');
  }
};

// POST /admin/faqs/delete/:id
const deleteFAQ = async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    req.flash('success', 'FAQ deleted successfully');
    res.redirect('/admin/faqs');
  } catch (error) {
    req.flash('error', 'Failed to delete FAQ');
    res.redirect('/admin/faqs');
  }
};

// CUSTOMER SEGMENTATION ANALYTICS

// GET /admin/customers/segments
const getCustomerSegmentation = async (req, res) => {
  try {
    // 1. Get all users and their order stats - Correct field is userId
    const userStats = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' }
    ]);

    // 2. Define Segment Labels & Logic
    const segments = {
      'Big Spenders': [], // Spent > ₹20,000
      'Regulars': [],     // >= 3 orders
      'New Shoppers': [],  // 1-2 orders
      'Window Shoppers': [] // 0 orders
    };

    // 3. Process aggregated stats
    userStats.forEach(stat => {
      if (stat.totalSpent > 20000) segments['Big Spenders'].push(stat);
      else if (stat.orderCount >= 3) segments['Regulars'].push(stat);
      else segments['New Shoppers'].push(stat);
    });

    // 4. Find users with 0 orders (Window Shoppers)
    const buyers = userStats.map(s => s._id.toString());
    const potentialWindowShoppers = await User.find({ _id: { $nin: buyers } }).limit(50);
    
    potentialWindowShoppers.forEach(u => {
      segments['Window Shoppers'].push({
        userDetails: u,
        totalSpent: 0,
        orderCount: 0,
        lastOrderDate: 'N/A'
      });
    });

    res.render('admin/customer_segments', {
      title: 'Customer Segmentation - EcomSphere',
      adminUsername: req.session.adminUsername,
      segments,
      errors: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (error) {
    console.error('Segmentation error:', error);
    req.flash('error', 'Failed to generate customer segments');
    res.redirect('/admin/dashboard');
  }
};

module.exports = {
  getAdminLogin,
  postAdminLogin,
  adminLogout,
  getDashboard,
  getProducts,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  deleteProduct,
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  deleteOrder,
  getUsers,
  deleteUser,
  getSettings,
  updateSettings,
  getBlogs,
  addBlogForm,
  addBlog,
  editBlogForm,
  updateBlog,
  deleteBlog,
  getCoupons,
  getAddCoupon,
  postAddCoupon,
  getEditCoupon,
  postEditCoupon,
  deleteCoupon,
  getBulkUpload,
  postBulkUpload,
  getMarketing,
  postAddBanner,
  deleteBanner,
  postUpdateFlashSale,
  deleteSubscriber,
  getInventory,
  postUpdateStock,
  getFAQs,
  postAddFAQ,
  getEditFAQ,
  postUpdateFAQ,
  deleteFAQ,
  getCustomerSegmentation,
  getSearchAnalytics
};
 
 // GET /admin/products/bulk
 function getBulkUpload(req, res) {
   res.render('admin/bulk_upload', {
     title: 'Bulk Product Import - Admin',
     adminUsername: req.session.adminUsername,
     errors: req.flash('error'),
     success: req.flash('success'),
     activePage: 'products'
   });
 }
 
 // POST /admin/products/bulk
 async function postBulkUpload(req, res) {
   if (!req.file) {
     req.flash('error', 'Please select a CSV file to upload.');
     return res.redirect('/admin/products/bulk');
   }
 
   const products = [];
   const errors = [];
   let rowCount = 0;
 
   fs.createReadStream(req.file.path)
     .pipe(csv())
     .on('data', (row) => {
       rowCount++;
       // Basic validation
       if (!row.name || !row.price) {
         errors.push(`Row ${rowCount}: Name and Price are required.`);
         return;
       }
 
       products.push({
         name: row.name.trim(),
         description: row.description || '',
         price: parseFloat(row.price),
         category: row.category || 'Uncategorized',
         brand: row.brand || 'EcomSphere',
         countInStock: parseInt(row.countInStock) || 0,
         image: row.image || '/img/products/f1.jpg',
         status: 'In Stock' // Model middleware will auto-adjust this on save
       });
     })
     .on('end', async () => {
       try {
         // Cleanup the uploaded temp file
         fs.unlinkSync(req.file.path);
 
         if (errors.length > 0) {
           req.flash('error', `Import partially failed: ${errors[0]}`);
           return res.redirect('/admin/products/bulk');
         }
 
         if (products.length === 0) {
           req.flash('error', 'The CSV file is empty or formatted incorrectly.');
           return res.redirect('/admin/products/bulk');
         }
 
         // Save all products (batch insert)
         await Product.insertMany(products);
         
         req.flash('success', `Successfully imported ${products.length} products!`);
         res.redirect('/admin/products');
       } catch (err) {
         console.error('Bulk import save error:', err);
         req.flash('error', 'Failed to save products. Check if your data has duplicate names or invalid values.');
         res.redirect('/admin/products/bulk');
       }
     });
 }
 
 // GET /admin/coupons
 async function getCoupons(req, res) {
   try {
     const coupons = await Coupon.find().sort({ createdAt: -1 });
     res.render('admin/coupons', {
       title: 'Coupon Management - Admin',
       adminUsername: req.session.adminUsername,
       coupons,
       errors: req.flash('error'),
       success: req.flash('success'),
       activePage: 'coupons'
     });
   } catch (error) {
     console.error('Admin coupons error:', error);
     req.flash('error', 'Failed to load coupons');
     res.redirect('/admin/dashboard');
   }
 }
 
 // GET /admin/coupons/add
 function getAddCoupon(req, res) {
   res.render('admin/add_coupon', {
     title: 'Add Coupon - Admin',
     adminUsername: req.session.adminUsername,
     errors: req.flash('error'),
     activePage: 'coupons'
   });
 }
 
 // POST /admin/coupons/add
 async function postAddCoupon(req, res) {
   try {
     const { code, discountType, discountValue, minPurchase, expiryDate, usageLimit, isActive } = req.body;
 
     const coupon = new Coupon({
       code: code.toUpperCase(),
       discountType,
       discountValue,
       minPurchase: minPurchase || 0,
       expiryDate,
       usageLimit: usageLimit || null,
       isActive: isActive === 'on' ? true : false
     });
 
     await coupon.save();
     req.flash('success', 'Coupon created successfully!');
     res.redirect('/admin/coupons');
   } catch (error) {
     console.error('Add coupon error:', error);
     req.flash('error', error.code === 11000 ? 'Coupon code already exists' : 'Failed to create coupon');
     res.redirect('/admin/coupons/add');
   }
 }
 
 // GET /admin/coupons/edit/:id
 async function getEditCoupon(req, res) {
   try {
     const coupon = await Coupon.findById(req.params.id);
     if (!coupon) return res.redirect('/admin/coupons');
     res.render('admin/edit_coupon', {
       title: 'Edit Coupon - Admin',
       coupon,
       adminUsername: req.session.adminUsername,
       errors: req.flash('error'),
       activePage: 'coupons'
     });
   } catch (error) {
     res.redirect('/admin/coupons');
   }
 }
 
 // POST /admin/coupons/edit/:id
 async function postEditCoupon(req, res) {
   try {
     const { code, discountType, discountValue, minPurchase, expiryDate, usageLimit, isActive } = req.body;
     await Coupon.findByIdAndUpdate(req.params.id, {
       code: code.toUpperCase(),
       discountType,
       discountValue,
       minPurchase: minPurchase || 0,
       expiryDate,
       usageLimit: usageLimit || null,
       isActive: isActive === 'on' ? true : false
     });
     req.flash('success', 'Coupon updated successfully!');
     res.redirect('/admin/coupons');
   } catch (error) {
     req.flash('error', 'Failed to update coupon');
     res.redirect(`/admin/coupons/edit/${req.params.id}`);
   }
 }
 
 async function deleteCoupon(req, res) {
   try {
     await Coupon.findByIdAndDelete(req.params.id);
     req.flash('success', 'Coupon deleted successfully!');
     res.redirect('/admin/coupons');
   } catch (error) {
     req.flash('error', 'Failed to delete coupon');
     res.redirect('/admin/coupons');
   }
 }
