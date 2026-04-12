const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../../models/User');
const Admin = require('../../../models/Admin');

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

module.exports = router;
