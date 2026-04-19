const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const FlashSale = require('../../models/FlashSale');
const HeroBanner = require('../../models/HeroBanner');
const { dbCache } = require('../../utils/cacheManager');

// GET /api/v1/products - JSON API with Search, Filter, Sort & Pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const { category, search, sort } = req.query;

    // Build Query
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build Sort
    let sortOption = { createdAt: -1 };
    if (sort === 'priceAsc') sortOption = { price: 1 };
    else if (sort === 'priceDesc') sortOption = { price: -1 };
    else if (sort === 'nameAsc') sortOption = { name: 1 };
    else if (sort === 'nameDesc') sortOption = { name: -1 };

    if (page && limit) {
      // 1. Paginated Response
      const skip = (page - 1) * limit;
      const totalCount = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

      return res.status(200).json({
        success: true,
        products,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      });
    }

    // 2. Legacy/Full Response
    const products = await Product.find(query).sort(sortOption);

    // Group by category for Home Page compatibility if no specific category is filtered
    const grouped = {};
    if (!category || category === 'All') {
      const uniqueCats = [...new Set(products.map(p => p.category))];
      uniqueCats.forEach(cat => {
        grouped[cat] = products.filter(p => p.category === cat);
      });
    }

    res.status(200).json({ success: true, count: products.length, data: products, grouped });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Get All Categories
// @route   GET /api/v1/products/categories/list
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

// @desc    Get Marketing Assets (Banners & Flash Sale)
// @route   GET /api/v1/products/marketing/assets
router.get('/marketing/assets', async (req, res) => {
  try {
    const [banners, flashSale] = await Promise.all([
      HeroBanner.find().sort({ createdAt: -1 }),
      FlashSale.findOne({ isActive: true }).sort({ createdAt: -1 })
    ]);
    res.status(200).json({ success: true, banners, flashSale });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Marketing sync failure' });
  }
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

const { postAddReview } = require('../../controllers/product.controller');
const { isAuthenticatedApi } = require('../../middleware/auth.api.middleware');

// @desc    Add product review
// @route   POST /api/v1/products/review
router.post('/review', isAuthenticatedApi, postAddReview);

// @desc    Get All FAQs (Public)
// @route   GET /api/v1/products/faqs
router.get('/faqs', async (req, res) => {
  try {
    const FAQ = require('../../models/FAQ');
    const faqs = await FAQ.find({ isVisible: true }).sort({ category: 1, order: 1 });
    res.status(200).json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch FAQs' });
  }
});

// @desc    Get Multiple Products by IDs
// @route   GET /api/v1/products/bulk
router.get('/bulk', async (req, res) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    if (ids.length === 0) return res.status(200).json({ success: true, data: [] });
    const products = await Product.find({ _id: { $in: ids } });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bulk products' });
  }
});

module.exports = router;
