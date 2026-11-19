const passport = require('passport');

function verifyToken(request, response, next) {
  passport.authenticate('jwt', { session: false }, (error, user) => {
    if (error) return next(error);
    if (!user) {
      return response.status(401).json({ message: 'Authentication required' });
    }
    request.user = user;
    return next();
  })(request, response, next);
}

function authorizeRoles(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return response.status(403).json({ message: 'You do not have permission to access this resource' });
    }
    return next();
  };
}

module.exports = { verifyToken, authorizeRoles };
