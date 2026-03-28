const mongoose = require('mongoose');

const CATEGORIES = ['Men Clothing', 'Women Clothing', 'Footwear', 'Glasses', 'Cosmetics'];

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [255, 'Product name cannot exceed 255 characters'],
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  image: {
    type: String,
    required: [true, 'Product image is required'],
    default: 'placeholder.jpg',
  },
  additionalImages: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: CATEGORIES,
      message: `Category must be one of: ${CATEGORIES.join(', ')}`,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Static method to get all categories
productSchema.statics.getCategories = function () {
  return CATEGORIES;
};

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
