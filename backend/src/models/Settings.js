const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  address: { type: String, default: 'SSCCS' },
  phone: { type: String, default: '+91 8160730726, +91 6359401196' },
  hours: { type: String, default: '10:00 - 18:00, Mon - Sat' },
  email: { type: String, default: 'contact@ecomsphere.com' },
  logo: { type: String, default: '/img/logo.png' }
});

module.exports = mongoose.model('Settings', settingsSchema);
