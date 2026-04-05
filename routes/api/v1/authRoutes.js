const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../../models/User');

// POST /api/v1/auth/login - Stateless JWT Authentication
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // 1. Verify User
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // 2. Issue Stateless JWT Token (No express-session needed!)
    const payload = { id: user._id.toString(), role: 'user' };
    const secret = process.env.JWT_SECRET || 'ecomsphere_super_secret_jwt';
    
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    // 3. Return Token to Next.js Client
    res.status(200).json({ 
      success: true, 
      token: token, 
      user: { 
          id: user._id, 
          username: user.username, 
          email: user.email 
      } 
    });
  } catch (error) {
    console.error('JWT Auth Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
