const Admin = require('../models/Admin');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Blog = require('../models/Blog');
const Settings = require('../models/Settings');
const Coupon = require('../models/Coupon');
const path = require('path');
const fs = require('fs');

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
    const [productCount, userCount, orderCount, products] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Product.find().sort({ createdAt: -1 }),
    ]);

    const recentOrders = await Order.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard - EcomSphere',
      adminUsername: req.session.adminUsername,
      products,
      productCount,
      userCount,
      orderCount,
      recentOrders,
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
};
 
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
