const User = require('../models/User');
const crypto = require('crypto');

// GET /auth/login
const getLogin = (req, res) => {
  res.render('login', {
    title: 'Login - EcomSphere',
    errors: req.flash('error'),
    success: req.flash('success'),
  });
};

// POST /auth/login
const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error', 'Email and password are required');
      return res.redirect('/auth/login');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await user.comparePassword(password))) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    // Create session
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    req.session.userEmail = user.email;

    req.flash('success', `Welcome back, ${user.username}!`);
    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/auth/login');
  }
};

// GET /auth/register
const getRegister = (req, res) => {
  res.render('register', {
    title: 'Register - EcomSphere',
    errors: req.flash('error'),
    success: req.flash('success'),
  });
};

// POST /auth/register
const postRegister = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password) {
      req.flash('error', 'All fields are required');
      return res.redirect('/auth/register');
    }

    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/auth/register');
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters');
      return res.redirect('/auth/register');
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      req.flash(
        'error',
        existingUser.email === email.toLowerCase()
          ? 'Email already registered'
          : 'Username already taken'
      );
      return res.redirect('/auth/register');
    }

    // Create new user
    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    await user.save();

    req.flash('success', 'Registration successful! Please login.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      req.flash('error', 'Email or username already exists');
    } else {
      req.flash('error', 'Registration failed. Please try again.');
    }
    res.redirect('/auth/register');
  }
};

// GET /auth/logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.redirect('/auth/login');
  });
};

// GET /auth/forgot-password
const getForgotPassword = (req, res) => {
  res.render('forgot_password', {
    title: 'Forgot Password - EcomSphere',
    errors: req.flash('error'),
    success: req.flash('success'),
  });
};

// POST /auth/forgot-password
const postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      req.flash('error', 'No account found with that email address');
      return res.redirect('/auth/forgot-password');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetToken = resetToken;
    user.tokenExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    // In production, send email. For now, show the link.
    const resetLink = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;
    req.flash('success', `Password reset link (demo): ${resetLink}`);
    res.redirect('/auth/forgot-password');
  } catch (error) {
    console.error('Forgot password error:', error);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/auth/forgot-password');
  }
};

// GET /auth/reset-password/:token
const getResetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      tokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      req.flash('error', 'Invalid or expired reset link');
      return res.redirect('/auth/forgot-password');
    }

    res.render('reset_password', {
      title: 'Reset Password - EcomSphere',
      token: req.params.token,
      errors: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (error) {
    console.error('Get reset password error:', error);
    res.redirect('/auth/forgot-password');
  }
};

// POST /auth/reset-password/:token
const postResetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect(`/auth/reset-password/${req.params.token}`);
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters');
      return res.redirect(`/auth/reset-password/${req.params.token}`);
    }

    const user = await User.findOne({
      resetToken: req.params.token,
      tokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      req.flash('error', 'Invalid or expired reset link');
      return res.redirect('/auth/forgot-password');
    }

    user.password = password;
    user.resetToken = null;
    user.tokenExpiry = null;
    await user.save();

    req.flash('success', 'Password reset successful! Please login with your new password.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Reset password error:', error);
    req.flash('error', 'Password reset failed. Please try again.');
    res.redirect('/auth/forgot-password');
  }
};

module.exports = {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  logout,
  getForgotPassword,
  postForgotPassword,
  getResetPassword,
  postResetPassword,
};
