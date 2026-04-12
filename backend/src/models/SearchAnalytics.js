const mongoose = require('mongoose');

const searchAnalyticsSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster aggregation
searchAnalyticsSchema.index({ query: 1, timestamp: -1 });

module.exports = mongoose.model('SearchAnalytics', searchAnalyticsSchema);
