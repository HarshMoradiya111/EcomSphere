const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Fix: ensure callbackURL always includes /api/v1
function resolveCallbackURL() {
  const raw = process.env.CALLBACK_URL || '';
  // If the env var is missing the /api/v1 prefix, fix it
  if (raw && !raw.includes('/api/v1/')) {
    return raw.replace('/auth/google/callback', '/api/v1/auth/google/callback');
  }
  return raw;
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: resolveCallbackURL(),
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Check if user already exists
      let user = await User.findOne({ 
        $or: [
          { googleId: profile.id },
          { email: profile.emails[0].value }
        ]
      });

      if (user) {
        // Update googleId if it wasn't there (linked account)
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      }

      // 2. Create new user if doesn't exist
      user = await User.create({
        username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
        email: profile.emails[0].value,
        googleId: profile.id,
        profilePhoto: profile.photos[0]?.value || '/img/rprofile/1.jpg'
      });

      done(null, user);
    } catch (err) {
      console.error('Google Auth Error:', err);
      done(err, null);
    }
  }
));

// We don't need serialize/deserialize because we are using stateless JWT,
// but passport might require them to be defined.
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
