const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const User = require('../../models/User');
const Order = require('../../models/Order');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const { dbCache } = require('../../utils/cacheManager');

// Multer storage for CSV payloads
const bulkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../public/uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `bulk-${Date.now()}-${file.originalname}`);
  }
});
const uploadBulk = multer({ storage: bulkStorage });

// Cloudinary storage for general admin images (Settings, Banners, Blogs)
const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecomsphere/general',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
  },
});

// Specific storage for AI Cataloging (temp folder)
const aiStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecomsphere/ai_temp',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: cloudStorage });
const uploadAI = multer({ storage: aiStorage });
const uploadStandard = multer({ storage: cloudStorage }); // Generic fallback

// @desc    Mass Ingestion (Bulk CSV Import)
// @route   POST /api/v1/admin/products/bulk
router.post('/products/bulk', uploadBulk.single('csvFile'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No payload detected' });

  const products = [];
  const errors = [];
  let rowCount = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
      rowCount++;
      if (!row.name || !row.price) {
        errors.push(`Row ${rowCount}: Critical Data Missing`);
        return;
      }
      products.push({
        name: row.name.trim(),
        description: row.description || '',
        price: parseFloat(row.price),
        category: row.category || 'Uncategorized',
        countInStock: parseInt(row.countInStock) || 0,
        image: row.image || 'placeholder.jpg'
      });
    })
    .on('end', async () => {
      try {
        fs.unlinkSync(req.file.path);
        if (products.length === 0) return res.status(400).json({ success: false, error: 'Empty Buffer' });
        
        await Product.insertMany(products);
        await dbCache.del('home_products'); // Invalidate
        
        res.status(200).json({ success: true, count: products.length });
      } catch (err) {
        res.status(500).json({ success: false, error: 'Ingestion Fault' });
      }
    });
});

// @desc    Get dashboard statistics for the React Admin Panel
// @route   GET /api/v1/admin/stats
// @access  Private (Admin Role Required)
router.get('/stats', async (req, res) => {
  try {
    const [productCount, userCount, orderCount, zeroStockCount] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments({ countInStock: 0 }),
    ]);

    // Financial Pipeline (Revenue in Shipped status)
    const pipelineRevenueData = await Order.aggregate([
      { $match: { status: 'Shipped' } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const pipelineRevenue = pipelineRevenueData[0]?.total || 0;

    // Top Selling Products (Velocity)
    const topSellers = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          name: "$productInfo.name",
          totalQuantity: 1,
          revenue: 1
        }
      }
    ]);

    // Category Sales Distribution
    const categorySales = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
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

    res.status(200).json({
      success: true,
      stats: {
        productCount,
        userCount,
        orderCount,
        zeroStockCount,
        pipelineRevenue,
        topSellers,
        categorySales
      }
    });
  } catch (error) {
    console.error('Admin API Stats Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


// @desc    Get all products for the React Admin table
// @route   GET /api/v1/admin/products
// @access  Private (Admin)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Create new product from React Admin
// @route   POST /api/v1/admin/products
// @access  Private (Admin)
router.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    // 🔥 CRITICAL: Invalidate Cache on mutation
    await dbCache.del('home_products');

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Creation failed' });
  }
});

// @desc    Update stock in-place for high-velocity inventory management
// @route   PATCH /api/v1/admin/products/:id/stock
// @access  Private (Admin)
router.patch('/products/:id/stock', async (req, res) => {
  try {
    const { countInStock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { countInStock },
      { new: true, runValidators: true }
    );
    
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    // 🔥 CRITICAL: Invalidate Cache on mutation
    await dbCache.del('all_products_cache'); // Assuming this key exists on public side
    await dbCache.del('home_products');

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Stock sync failed' });
  }
});

// @desc    Delete product
// @route   DELETE /api/v1/admin/products/:id
// @access  Private (Admin)
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    // 🔥 CRITICAL: Invalidate Cache on mutation
    await dbCache.del('home_products');
    
    res.status(200).json({ success: true, message: 'Terminal deletion successful' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Deletion failed' });
  }
});

// @desc    Get all orders for the React Admin table
// @route   GET /api/v1/admin/orders
// @access  Private (Admin)
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Update order status for logistics tracking
// @route   PATCH /api/v1/admin/orders/:id/status
// @access  Private (Admin)
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Status update failed' });
  }
});

const Blog = require('../../models/Blog');
const HeroBanner = require('../../models/HeroBanner');
const Settings = require('../../models/Settings');
const Coupon = require('../../models/Coupon');
const FlashSale = require('../../models/FlashSale');
const Newsletter = require('../../models/Newsletter');
const FAQ = require('../../models/FAQ');

// @desc    Get Global Website Settings
// @route   GET /api/v1/admin/settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await Settings.findOne() || {};
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Settings fetch failed' });
  }
});

// @desc    Update Global Website Settings
// @route   PUT /api/v1/admin/settings
router.put('/settings', upload.single('logo'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    const updateData = { ...req.body };
    if (req.file) updateData.logo = req.file.filename;

    if (!settings) {
      settings = new Settings(updateData);
    } else {
      Object.assign(settings, updateData);
    }
    await settings.save();
    
    // 🔥 Clear General Cache
    await dbCache.del('site_settings');
    
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Settings update failed' });
  }
});

// @desc    Add Marketing Banner (with manual upload)
// @route   POST /api/v1/admin/banners
router.post('/banners', upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, buttonText, buttonLink } = req.body;
    const banner = new HeroBanner({
      title,
      subtitle,
      buttonText,
      buttonLink,
      image: req.file ? req.file.filename : 'placeholder.jpg'
    });
    await banner.save();
    
    // 🔥 Clear General Cache
    await dbCache.del('hero_banners');
    
    res.status(201).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Banner deployment failed' });
  }
});

// @desc    Delete Marketing Banner
// @route   DELETE /api/v1/admin/banners/:id
router.delete('/banners/:id', async (req, res) => {
  try {
    const banner = await HeroBanner.findByIdAndDelete(req.params.id);
    if (banner && banner.image && banner.image !== 'placeholder.jpg') {
       const imgPath = path.join(__dirname, '../../../public/uploads', banner.image);
       if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    
    // 🔥 Clear General Cache
    await dbCache.del('hero_banners');
    
    res.status(200).json({ success: true, message: 'Banner de-provisioned' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Deletion aborted' });
  }
});

// @desc    Get Flash Sale Configuration
// @route   GET /api/v1/admin/flash-sale
router.get('/flash-sale', async (req, res) => {
  try {
    const flashSales = await FlashSale.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, flashSales });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Flash Sale fetch failed' });
  }
});

// @desc    Update/Create Flash Sale Campaign
// @route   POST /api/v1/admin/flash-sale
router.post('/flash-sale', async (req, res) => {
  try {
    const { title, discountText, endTime, isActive } = req.body;
    const flashSale = new FlashSale({ title, discountText, endTime, isActive });
    await flashSale.save();
    
    // 🔥 Clear General Cache
    await dbCache.del('flash_sale_active');
    
    res.status(201).json({ success: true, flashSale });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Campaign update failed' });
  }
});

// @desc    Get Newsletter Subscribers
// @route   GET /api/v1/admin/subscribers
router.get('/subscribers', async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });
    res.status(200).json({ success: true, subscribers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Subscriber fetch failure' });
  }
});

// @desc    Delete Subscriber
// @route   DELETE /api/v1/admin/subscribers/:id
router.delete('/subscribers/:id', async (req, res) => {
  try {
    await Newsletter.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Identity purged from newsletter core' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Purge failed' });
  }
});

// @desc    Get All Coupons (Control Hub)
// @route   GET /api/v1/admin/coupons
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Coupons fetch failed' });
  }
});

// @desc    Create Coupon
// @route   POST /api/v1/admin/coupons
router.post('/coupons', async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Coupon creation failed' });
  }
});

// @desc    Delete Coupon
// @route   DELETE /api/v1/admin/coupons/:id
router.delete('/coupons/:id', async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Coupon deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Deletion aborted' });
  }
});

// @desc    Get All Blogs
// @route   GET /api/v1/admin/blogs
router.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 });
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Blog fetch failed' });
  }
});

// AI CATALOGING API ENDPOINTS
const { analyzeProductImage } = require('../../services/ai.service');

// @desc    AI Bulk Image Upload & Analysis
// @route   POST /api/v1/admin/products/ai
router.post('/products/ai', uploadAI.array('productImages', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No vision assets detected' });
    }

    const CATEGORIES = ['Footwear', 'Apparel', 'Accessories', 'Electronics', 'Kitchen', 'Fitness', 'Personal Care'];
    const results = [];
    const errors = [];

    for (const file of req.files) {
      try {
        // AI Vision Analysis
        const aiData = await analyzeProductImage(file.path);
        results.push({
          ...aiData,
          tempImage: file.path // This is the Cloudinary URL
        });
      } catch (err) {
        console.error('AI Processing error for:', file.path, err);
        errors.push(`Failed to analyze: ${file.originalname}`);
      }
    }

    res.status(200).json({
      success: true,
      products: results,
      errors: errors.length > 0 ? errors : null,
      categories: CATEGORIES
    });
  } catch (error) {
    console.error('AI Catalog Error:', error);
    res.status(500).json({ success: false, error: 'AI Neural Link Failure' });
  }
});

// @desc    Confirm & Save AI Products
// @route   POST /api/v1/admin/products/save-ai
router.post('/products/save-ai', async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products)) {
        return res.status(400).json({ success: false, error: 'No data payload' });
    }

    const savedProducts = await Product.insertMany(products);
    await dbCache.del('home_products');

    res.status(201).json({ 
        success: true, 
        count: savedProducts.length,
        message: 'Intelligence successfully integrated into catalog' 
    });
  } catch (error) {
    console.error('AI Save Error:', error);
    res.status(500).json({ success: false, error: 'Database commitment failed' });
  }
});

const SearchAnalytics = require('../../models/SearchAnalytics');

// @desc    Get High-Velocity Search Analytics (Top Queries)
// @route   GET /api/v1/admin/search-analytics
router.get('/search-analytics', async (req, res) => {
  try {
    const topSearches = await SearchAnalytics.aggregate([
      { $group: { _id: "$query", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.status(200).json({ success: true, topSearches });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Analytics engine failure' });
  }
});



// @desc    Get single product for editing
// @route   GET /api/v1/admin/products/:id
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Full Product Update
// @route   PUT /api/v1/admin/products/:id
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    
    // Invalidate Cache
    await dbCache.del('home_products');
    
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Update failed' });
  }
});

// @desc    Get full order details with product population
// @route   GET /api/v1/admin/orders/:id
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.productId');
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Get all users (Customer Management)
// @route   GET /api/v1/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'User fetch failed' });
  }
});

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User purged from database' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Deletion aborted' });
  }
});

// @desc    Create Blog Post
// @route   POST /api/v1/admin/blogs
router.post('/blogs', async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.status(201).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Blog creation failed' });
  }
});

// @desc    Delete Blog Post
// @route   DELETE /api/v1/admin/blogs/:id
router.delete('/blogs/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Article decommissioned' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Deletion failed' });
  }
});

// @desc    Get All FAQs
// @route   GET /api/v1/admin/faqs
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find();
    res.status(200).json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'FAQ fetch failure' });
  }
});

// @desc    Create FAQ
// @route   POST /api/v1/admin/faqs
router.post('/faqs', async (req, res) => {
  try {
    const faq = new FAQ(req.body);
    await faq.save();
    res.status(201).json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, error: 'FAQ deployment failed' });
  }
});

// @desc    Delete FAQ
// @route   DELETE /api/v1/admin/faqs/:id
router.delete('/faqs/:id', async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'FAQ de-provisioned' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Deletion aborted' });
  }
});

// @desc    Customer Behavioral Segmentation (Advanced Clustering)
// @route   GET /api/v1/admin/customers/segments
router.get('/customers/segments', async (req, res) => {
  try {
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

    const segments = {
      'Big Spenders': [], // Spent > ₹20,000
      'Regulars': [],     // >= 3 orders
      'New Shoppers': [],  // 1-2 orders
      'Window Shoppers': [] // 0 orders
    };

    userStats.forEach(stat => {
      if (stat.totalSpent > 20000) segments['Big Spenders'].push(stat);
      else if (stat.orderCount >= 3) segments['Regulars'].push(stat);
      else segments['New Shoppers'].push(stat);
    });

    const buyers = userStats.map(s => s._id?.toString());
    const windowShoppers = await User.find({ _id: { $nin: buyers } }).limit(50);
    
    windowShoppers.forEach(u => {
      segments['Window Shoppers'].push({
        userDetails: u,
        totalSpent: 0,
        orderCount: 0,
        lastOrderDate: 'N/A'
      });
    });

    res.status(200).json({ success: true, segments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Segmentation failure' });
  }
});

module.exports = router;
