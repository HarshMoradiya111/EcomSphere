const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  discountText: { type: String, required: true },
  endTime: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FlashSale', flashSaleSchema);
