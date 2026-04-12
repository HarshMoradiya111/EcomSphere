const Product = require('../models/Product');
const Category = require('../models/Product').CATEGORIES;

/**
 * Product Service
 * Handles all business logic for product operations
 */
const getProductsByCategory = async () => {
  const CATEGORIES = ['Men Clothing', 'Women Clothing', 'Footwear', 'Glasses', 'Cosmetics'];
  const productsByCategory = {};
  for (const category of CATEGORIES) {
    productsByCategory[category] = await Product.find({ category }).sort({ createdAt: -1 }).lean();
  }
  return productsByCategory;
};

const filterProducts = async (filters) => {
  const { category, search, minPrice, maxPrice, sortBy } = filters;
  const query = {};

  if (category) query.category = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sortBy) {
    switch (sortBy) {
      case 'price-low': sortOption = { price: 1 }; break;
      case 'price-high': sortOption = { price: -1 }; break;
      case 'oldest': sortOption = { createdAt: 1 }; break;
      case 'newest': sortOption = { createdAt: -1 }; break;
    }
  }

  return await Product.find(query).sort(sortOption);
};

const getProductById = async (id) => {
  return await Product.findById(id);
};

module.exports = {
  getProductsByCategory,
  filterProducts,
  getProductById
};
