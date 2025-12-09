const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('./index');
const User = require('../models/User');

// Email normalization function
function normalizeEmail(email) {
  if (!email) return email;
  
  const normalized = email.toLowerCase().trim();
  
  // Handle Gmail addresses - remove dots from username
  if (normalized.includes('@gmail.com')) {
    const [username, domain] = normalized.split('@');
    return `${username.replace(/\./g, '')}@${domain}`;
  }
  
  return normalized;
}

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT_SECRET,
};

module.exports = (passport) => {
  // JWT Strategy
  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      try {
        const user = await User.findById(payload.id).select('-password');
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    })
  );

  // Google OAuth Strategy
  if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.GOOGLE_CLIENT_ID,
          clientSecret: config.GOOGLE_CLIENT_SECRET,
          callbackURL: config.GOOGLE_CALLBACK_URL,
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists with Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
              // Update last login
              user.lastLogin = new Date();
              await user.save();
              return done(null, user);
            }

            // Check if email already exists
            const normalizedEmail = normalizeEmail(profile.emails[0].value);
            user = await User.findOne({ email: normalizedEmail });

            if (user) {
              // Link Google account to existing user and preserve their role
              user.googleId = profile.id;
              user.isEmailVerified = true;
              user.lastLogin = new Date();
              if (!user.avatar && profile.photos[0]) {
                user.avatar = profile.photos[0].value;
              }
              await user.save();
              return done(null, user);
            }

            // Create new user with job_seeker role (default behavior for new Google signups)
            const newUser = new User({
              googleId: profile.id,
              email: normalizedEmail,
              name: profile.displayName,
              avatar: profile.photos[0]?.value,
              isEmailVerified: true,
              authProvider: 'google',
            });

            await newUser.save();
            return done(null, newUser);
          } catch (error) {
            return done(error, false);
          }
        }
      )
    );
  }
};
