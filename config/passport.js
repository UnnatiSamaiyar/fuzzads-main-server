const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Make sure the path is correct
const bcrypt = require('bcrypt'); // To hash a random password
require('dotenv').config(); // Load environment variables

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await User.findOne({ googleId: profile.id });

    if (existingUser) {
      return done(null, existingUser);
    }

    // Generate a random password for Google signups
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create a new user with Google profile data
    const newUser = new User({
      googleId: profile.id,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      password: hashedPassword, // Store the hashed random password
    });

    await newUser.save();
    done(null, newUser);
  } catch (err) {
    console.error(err);
    done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error(err);
    done(err, null);
  }
});
