const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
cartSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for total cart price
cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
});

// Virtual for total item count
cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

module.exports = mongoose.model('Cart', cartSchema);
