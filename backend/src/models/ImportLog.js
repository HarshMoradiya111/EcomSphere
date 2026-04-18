const mongoose = require('mongoose');

const importLogSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Success', 'Failed'],
    default: 'Success'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ImportLog', importLogSchema);
