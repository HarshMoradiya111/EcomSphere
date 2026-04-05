const express = require('express');
const router = express.Router();
const Product = require('../../../models/Product');
const { dbCache } = require('../../../utils/cacheManager');

// GET /api/v1/products - JSON API for the future React/Next.js frontend
router.get('/', async (req, res) => {
  try {
    let products = await dbCache.get('api_v1_products');
    
    if (!products) {
      products = await Product.find({}).sort({ createdAt: -1 }).lean();
      // Cache the API payload for 5 minutes
      await dbCache.set('api_v1_products', products);
    }
    
    // Stateless JSON Response instead of res.render('shop', ...)
    res.status(200).json({ 
      success: true, 
      count: products.length, 
      data: products 
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// GET /api/v1/products/:id - Single Product JSON API
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ success: false, error: 'Product Not Found' });
    
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
