const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

function cookieOrBearerToken(request) {
  if (request.cookies && request.cookies.token) {
    return request.cookies.token;
  }
  return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
}

function configurePassport() {
  passport.use(new JwtStrategy({
    jwtFromRequest: cookieOrBearerToken,
    secretOrKey: process.env.JWT_SECRET
  }, async (payload, done) => {
    try {
      const user = await User.findById(payload.sub).select('-password');
      if (!user || user.role !== payload.role) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));
  return passport;
}

module.exports = configurePassport;
