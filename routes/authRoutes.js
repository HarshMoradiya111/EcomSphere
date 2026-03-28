const express = require('express');
const router = express.Router();
const {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  logout,
  getForgotPassword,
  postForgotPassword,
  getResetPassword,
  postResetPassword,
} = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middleware/auth');

router.get('/login', redirectIfAuthenticated, getLogin);
router.post('/login', redirectIfAuthenticated, postLogin);

router.get('/register', redirectIfAuthenticated, getRegister);
router.post('/register', redirectIfAuthenticated, postRegister);

router.get('/logout', logout);

router.get('/forgot-password', getForgotPassword);
router.post('/forgot-password', postForgotPassword);

router.get('/reset-password/:token', getResetPassword);
router.post('/reset-password/:token', postResetPassword);

module.exports = router;
