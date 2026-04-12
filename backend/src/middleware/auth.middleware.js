// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash('error', 'Please login to continue');
  return res.redirect('/auth/login');
};

// Middleware to check if admin is authenticated
const isAdminAuthenticated = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return next();
  }
  req.flash('error', 'Admin access required');
  return res.redirect('/admin/login');
};

// Middleware to redirect if already logged in (user)
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/');
  }
  return next();
};

// Middleware to redirect if admin already logged in
const redirectIfAdminAuthenticated = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }
  return next();
};

module.exports = {
  isAuthenticated,
  isAdminAuthenticated,
  redirectIfAuthenticated,
  redirectIfAdminAuthenticated,
};
