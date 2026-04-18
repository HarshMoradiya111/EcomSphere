const mongoose = require('mongoose');

const CATEGORIES = ['Men Clothing', 'Women Clothing', 'Footwear', 'Glasses', 'Cosmetics'];
 
const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: String,
  userPhoto: String,
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
 
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
  sizes: {
    type: [String],
    default: [],
  },
  colors: {
    type: [String],
    default: [],
  },
  countInStock: {
    type: Number,
    required: [true, 'Stock count is required'],
    min: [0, 'Stock cannot be negative'],
    default: 10,
  },
  status: {
    type: String,
    enum: ['In Stock', 'Out of Stock', 'Low Stock'],
    default: 'In Stock',
  },
  importId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ImportLog',
    default: null
  },
  reviews: [reviewSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});
 
// Pre-save middleware to update status based on stock count
productSchema.pre('save', function (next) {
  if (this.isModified('countInStock')) {
    if (this.countInStock === 0) {
      this.status = 'Out of Stock';
    } else if (this.countInStock <= 5) {
      this.status = 'Low Stock';
    } else {
      this.status = 'In Stock';
    }
  }
  next();
});

// Virtual for average rating
productSchema.virtual('averageRating').get(function () {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});
 
// Virtual for number of reviews
productSchema.virtual('numReviews').get(function () {
  return this.reviews.length;
});
 
// Static method to get all categories
productSchema.statics.getCategories = function () {
  return CATEGORIES;
};

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
