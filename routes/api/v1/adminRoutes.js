const express = require('express');
const router = express.Router();
const Product = require('../../../models/Product');
const User = require('../../../models/User');
const Order = require('../../../models/Order');

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

const dbCache = require('../../../utils/cacheManager'); // Import cache manager

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

module.exports = router;
