const jwt = require('jsonwebtoken');

const isAuthenticatedApi = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authorization token required' });
  }

  const secret = process.env.JWT_SECRET || 'ecomsphere_super_secret_jwt';
  
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user; // { id: ..., role: ... }
    next();
  });
};

const isAdminApi = (req, res, next) => {
  isAuthenticatedApi(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ success: false, error: 'Admin access required' });
  });
};

module.exports = {
  isAuthenticatedApi,
  isAdminApi
};
