const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to at least 32 characters');
}

// Export Express without opening a listener; Vercel owns the request lifecycle.
module.exports = require('./app');
