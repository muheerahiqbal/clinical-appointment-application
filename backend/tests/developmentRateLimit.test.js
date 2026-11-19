const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');

process.env.JWT_SECRET = 'test-secret-with-more-than-32-characters';
process.env.NODE_ENV = 'development';
process.env.RATE_LIMIT_MAX = '1';

const app = require('../app');

test('development API requests are not rate limited', async (t) => {
  const server = app.listen(0);
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  for (let index = 0; index < 3; index += 1) {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
  }

  for (let index = 0; index < 12; index += 1) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}'
    });
    assert.equal(response.status, 400);
  }
});
