const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if user already exists with this email
          user = await User.findOne({ email: profile.emails[0].value.toLowerCase() });

          if (user) {
            // Link Google ID if email already exists
            user.googleId = profile.id;
            if (!user.profilePhoto || user.profilePhoto === '/img/rprofile/1.jpg') {
              user.profilePhoto = profile.photos[0].value;
            }
            await user.save();
          } else {
            // Create new user
            user = await User.create({
              username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
              email: profile.emails[0].value.toLowerCase(),
              googleId: profile.id,
              profilePhoto: profile.photos[0].value,
              // Password not required for social login (handled in model)
            });
          }
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
