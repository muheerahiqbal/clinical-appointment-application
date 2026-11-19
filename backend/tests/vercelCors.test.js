const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');

process.env.JWT_SECRET = 'test-secret-with-more-than-32-characters';
process.env.NODE_ENV = 'production';
process.env.CLIENT_URL = 'https://clinical-appointment-application.vercel.app';
process.env.CORS_ORIGINS = '';

const app = require('../app');

test('CORS allows the deployed frontend and localhost with credentials', async (t) => {
  const server = app.listen(0);
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  for (const origin of [process.env.CLIENT_URL, 'http://localhost:5173']) {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'GET'
      }
    });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), origin);
    assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
  }

  const deniedResponse = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Origin: 'https://untrusted.example' }
  });
  assert.equal(deniedResponse.status, 403);
});
