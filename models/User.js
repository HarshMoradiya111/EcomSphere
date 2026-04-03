const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
  },
  profilePhoto: {
    type: String,
    default: '/img/rprofile/1.jpg'
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [function() {
      return !this.googleId && !this.facebookId;
    }, 'Password is required for local account'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple null values for this unique index
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true,
  },
  resetToken: {
    type: String,
    default: null,
  },
  tokenExpiry: {
    type: Date,
    default: null,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  addresses: [{
    street: String,
    city: String,
    state: String,
    zip: String,
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false }
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  loyaltyHistory: [{
    points: { type: Number, required: true },
    reason: { type: String, required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['earn', 'redeem'], default: 'earn' }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
