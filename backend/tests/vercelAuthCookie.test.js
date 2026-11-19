const assert = require('node:assert/strict');
const test = require('node:test');

process.env.JWT_SECRET = 'test-secret-with-more-than-32-characters';
process.env.NODE_ENV = 'production';

const User = require('../models/User');
const authController = require('../controllers/authController');

test('production login sets a secure cross-site HTTP-only cookie', async () => {
  const originalFindOne = User.findOne;
  let cookie;
  User.findOne = () => ({
    select: async () => ({
      id: 'test-admin-id',
      role: 'admin',
      comparePassword: async () => true
    })
  });

  const response = {
    cookie(name, token, options) {
      cookie = { name, token, options };
    },
    json(body) {
      this.body = body;
    }
  };

  try {
    await authController.login({
      body: { email: 'admin@example.com', password: 'valid-test-password' }
    }, response);
    assert.equal(cookie.name, 'token');
    assert.equal(cookie.options.httpOnly, true);
    assert.equal(cookie.options.secure, true);
    assert.equal(cookie.options.sameSite, 'none');
    assert.equal(response.body.user.role, 'admin');
  } finally {
    User.findOne = originalFindOne;
  }
});
