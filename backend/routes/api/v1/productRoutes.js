const express = require('express');
const router = express.Router();
const Product = require('../../../models/Product');
const FlashSale = require('../../../models/FlashSale');
const HeroBanner = require('../../../models/HeroBanner');
const { dbCache } = require('../../../utils/cacheManager');

// GET /api/v1/products - JSON API for the future React/Next.js frontend
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    // Group by category just like the EJS version
    const categories = [...new Set(products.map(p => p.category))];
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat] = products.filter(p => p.category === cat);
    });

    res.status(200).json({ success: true, count: products.length, data: products, grouped });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
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

module.exports = router;
