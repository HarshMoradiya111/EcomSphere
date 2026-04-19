const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const User = require('../../models/User');
const { isAuthenticatedApi } = require('../../middleware/auth.api.middleware');

// Multer for Profile Photos (Mirroring product.routes.js)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// GET /api/v1/user/profile - Get full profile with orders
router.get('/profile', isAuthenticatedApi, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, user, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load profile' });
  }
});

// POST /api/v1/user/profile/update - Update personal info
router.post('/profile/update', isAuthenticatedApi, async (req, res) => {
  try {
    const { username, email, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (username) user.username = username.trim();
    if (email) user.email = email.trim();
    if (phone) user.phone = phone.trim();

    await user.save();
    res.json({ success: true, user: { id: user._id, username: user.username, email: user.email, phone: user.phone } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// POST /api/v1/user/profile/address/add - Add new address
router.post('/profile/address/add', isAuthenticatedApi, async (req, res) => {
  try {
    const { street, city, state, zip, country, isDefault } = req.body;
    const user = await User.findById(req.user.id);

    const newAddress = {
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      country: country || 'India',
      isDefault: isDefault === true,
    };

    if (newAddress.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    } else if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add address' });
  }
});

// DELETE /api/v1/user/profile/address/:index - Delete address
router.delete('/profile/address/:index', isAuthenticatedApi, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const user = await User.findById(req.user.id);

    if (index >= 0 && index < user.addresses.length) {
      const removed = user.addresses.splice(index, 1)[0];
      if (removed.isDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
      }
      await user.save();
      return res.json({ success: true, addresses: user.addresses });
    }
    res.status(400).json({ success: false, error: 'Invalid address index' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete address' });
  }
});

// POST /api/v1/user/profile/photo - Upload photo
router.post('/profile/photo', isAuthenticatedApi, upload.single('profilePhoto'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    user.profilePhoto = '/uploads/' + req.file.filename;
    await user.save();
    res.json({ success: true, profilePhoto: user.profilePhoto });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to upload photo' });
  }
});

// GET /api/v1/user/wishlist - Get wishlist products
router.get('/wishlist', isAuthenticatedApi, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json({ success: true, wishlist: user ? user.wishlist : [] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch wishlist' });
  }
});

// POST /api/v1/user/wishlist/toggle - Toggle product in wishlist
router.post('/wishlist/toggle', isAuthenticatedApi, async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);
    
    const index = user.wishlist.indexOf(productId);
    let action = '';

    if (index > -1) {
      user.wishlist.splice(index, 1);
      action = 'removed';
    } else {
      user.wishlist.push(productId);
      action = 'added';
    }

    await user.save();
    res.json({ success: true, action, wishlistCount: user.wishlist.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to toggle wishlist' });
  }
});

module.exports = router;
