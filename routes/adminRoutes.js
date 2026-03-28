const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
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
} = require('../controllers/adminController');
const { isAdminAuthenticated, redirectIfAdminAuthenticated } = require('../middleware/auth');

// Multer configuration for product image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Auth routes
router.get('/login', redirectIfAdminAuthenticated, getAdminLogin);
router.post('/login', redirectIfAdminAuthenticated, postAdminLogin);
router.get('/logout', adminLogout);

// Dashboard
router.get('/dashboard', isAdminAuthenticated, getDashboard);

// Products
router.get('/products', isAdminAuthenticated, getProducts);
router.get('/products/add', isAdminAuthenticated, getAddProduct);
router.post('/products/add', isAdminAuthenticated, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), postAddProduct);
router.get('/products/edit/:id', isAdminAuthenticated, getEditProduct);
router.post('/products/edit/:id', isAdminAuthenticated, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), postEditProduct);
router.post('/products/delete/:id', isAdminAuthenticated, deleteProduct);

// Orders
router.get('/orders', isAdminAuthenticated, getOrders);
router.get('/orders/:id', isAdminAuthenticated, getOrderDetails);
router.post('/orders/:id/status', isAdminAuthenticated, updateOrderStatus);
router.post('/orders/:id/delete', isAdminAuthenticated, deleteOrder);

// Users
router.get('/users', isAdminAuthenticated, getUsers);
router.post('/users/:id/delete', isAdminAuthenticated, deleteUser);

// Settings
router.get('/settings', isAdminAuthenticated, getSettings);
router.post('/settings', isAdminAuthenticated, upload.single('logo'), updateSettings);

// Blogs
router.get('/blogs', isAdminAuthenticated, getBlogs);
router.get('/blogs/add', isAdminAuthenticated, addBlogForm);
router.post('/blogs/add', isAdminAuthenticated, upload.single('image'), addBlog);
router.get('/blogs/edit/:id', isAdminAuthenticated, editBlogForm);
router.put('/blogs/edit/:id', isAdminAuthenticated, upload.single('image'), updateBlog);
router.delete('/blogs/delete/:id', isAdminAuthenticated, deleteBlog);

module.exports = router;
