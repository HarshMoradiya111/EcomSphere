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
} = require('../../controllers/auth.controller');
const { redirectIfAuthenticated } = require('../../middleware/auth.middleware');
const passport = require('passport');

router.get('/login', redirectIfAuthenticated, getLogin);
router.post('/login', redirectIfAuthenticated, postLogin);

router.get('/register', redirectIfAuthenticated, getRegister);
router.post('/register', redirectIfAuthenticated, postRegister);

router.get('/logout', logout);

router.get('/forgot-password', getForgotPassword);
router.post('/forgot-password', postForgotPassword);

router.get('/reset-password/:token', getResetPassword);
router.post('/reset-password/:token', postResetPassword);
 
 // Google Auth
 router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
 router.get('/google/callback', 
   passport.authenticate('google', { failureRedirect: '/auth/login', failureFlash: true }),
   (req, res) => {
     req.flash('success', 'Logged in with Google successfully!');
     res.redirect('/');
   }
 );
 
 module.exports = router;

