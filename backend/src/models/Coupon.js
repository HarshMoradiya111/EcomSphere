const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    required: [true, 'Discount type is required (percentage or flat)'],
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative'],
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: [0, 'Minimum purchase cannot be negative'],
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to check if coupon is valid for a given amount
couponSchema.methods.isValid = function (totalAmount) {
  const now = new Date();
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (this.expiryDate < now) return { valid: false, message: 'Coupon has expired' };
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }
  if (totalAmount < this.minPurchase) {
    return { valid: false, message: `Minimum purchase of ₹${this.minPurchase} required` };
  }
  return { valid: true };
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function (totalAmount) {
  if (this.discountType === 'percentage') {
    return (totalAmount * this.discountValue) / 100;
  } else {
    // For flat discount, don't exceed total amount
    return Math.min(this.discountValue, totalAmount);
  }
};

module.exports = mongoose.model('Coupon', couponSchema);
