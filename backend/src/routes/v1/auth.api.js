const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const Admin = require('../../models/Admin');

// POST /api/v1/auth/login - Stateless JWT Authentication (User)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const payload = { id: user._id.toString(), role: 'user' };
    const secret = process.env.JWT_SECRET || 'ecomsphere_super_secret_jwt';
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    res.status(200).json({ success: true, token, user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// POST /api/v1/auth/register - User Registration
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = await User.create({ username, email, password });
    
    const payload = { id: user._id.toString(), role: 'user' };
    const secret = process.env.JWT_SECRET || 'ecomsphere_super_secret_jwt';
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    res.status(201).json({ success: true, token, user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// POST /api/v1/auth/admin/login - Stateless JWT Authentication (Admin)
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.comparePassword(password))) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const payload = { id: admin._id.toString(), role: 'admin' };
    const secret = process.env.JWT_SECRET || 'ecomsphere_super_secret_jwt';
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    res.status(200).json({ success: true, token, admin: { id: admin._id, username: admin.username } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

const passport = require('passport');

// @desc    Auth with Google
// @route   GET /api/v1/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /api/v1/auth/google/callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/auth/login?error=Google auth failed`, session: false }),
  (req, res) => {
    // On success, create JWT and redirect to frontend with token
    const payload = { id: req.user._id.toString(), role: 'user' };
    const secret = process.env.JWT_SECRET || 'ecomsphere_super_secret_jwt';
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    // Redirect to frontend with token in query param
    // The frontend will catch this and save it to localStorage
    res.redirect(`${process.env.CLIENT_URL}/auth/login?token=${token}`);
  }
);

module.exports = router;
