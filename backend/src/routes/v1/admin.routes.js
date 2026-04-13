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
  getSearchAnalytics,
  getAIUpload,
  postAIUpload,
  postSaveAIProducts,
} = require('../../controllers/admin.controller');
const { isAdminAuthenticated, redirectIfAdminAuthenticated } = require('../../middleware/auth.middleware');

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
  const allowedTypes = /jpeg|jpg|png|gif|webp|csv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isCSV = path.extname(file.originalname).toLowerCase() === '.csv';
  const mimetype = allowedTypes.test(file.mimetype) || (isCSV && (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel'));
  
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, gif, webp) or CSV files are allowed'));
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
router.get('/products/bulk', isAdminAuthenticated, getBulkUpload);
router.post('/products/bulk', isAdminAuthenticated, upload.single('csvFile'), postBulkUpload);
router.get('/products/ai', isAdminAuthenticated, getAIUpload);
router.post('/products/ai', isAdminAuthenticated, upload.array('productImages', 20), postAIUpload);
router.post('/products/save-ai', isAdminAuthenticated, postSaveAIProducts);


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
 
 // Coupons
 router.get('/coupons', isAdminAuthenticated, getCoupons);
 router.get('/coupons/add', isAdminAuthenticated, getAddCoupon);
 router.post('/coupons/add', isAdminAuthenticated, postAddCoupon);
 router.get('/coupons/edit/:id', isAdminAuthenticated, getEditCoupon);
 router.post('/coupons/edit/:id', isAdminAuthenticated, postEditCoupon);
 router.post('/coupons/delete/:id', isAdminAuthenticated, deleteCoupon);

// Marketing
router.get('/marketing', isAdminAuthenticated, getMarketing);
router.post('/marketing/banner', isAdminAuthenticated, upload.single('bannerImage'), postAddBanner);
router.post('/marketing/banner/delete/:id', isAdminAuthenticated, deleteBanner);
router.post('/marketing/flash-sale', isAdminAuthenticated, postUpdateFlashSale);
router.post('/marketing/subscribers/delete/:id', isAdminAuthenticated, deleteSubscriber);

// Inventory Management
router.get('/inventory', isAdminAuthenticated, getInventory);
router.post('/inventory/update-stock/:id', isAdminAuthenticated, postUpdateStock);

// FAQ Management
router.get('/faqs', isAdminAuthenticated, getFAQs);
router.post('/faqs/add', isAdminAuthenticated, postAddFAQ);
router.get('/faqs/edit/:id', isAdminAuthenticated, getEditFAQ);
router.post('/faqs/edit/:id', isAdminAuthenticated, postUpdateFAQ);
router.post('/faqs/delete/:id', isAdminAuthenticated, deleteFAQ);

// Customer Analytics
router.get('/customers/segments', isAdminAuthenticated, getCustomerSegmentation);
router.get('/customers/search-analytics', isAdminAuthenticated, getSearchAnalytics);

module.exports = router;
