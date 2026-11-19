const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const backendDirectory = path.resolve(__dirname, '..');
const script = `
  const fs = require('fs');
  let mkdirCalls = 0;
  let appendCalls = 0;
  let consoleCalls = 0;
  fs.mkdirSync = () => { mkdirCalls += 1; };
  fs.appendFile = () => { appendCalls += 1; };
  console.error = () => { consoleCalls += 1; };
  const { errorHandler } = require('./middlewares/errorMiddleware');
  const response = {
    headersSent: false,
    statusCode: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
  errorHandler(new Error('test failure'), { method: 'GET', path: '/test' }, response, () => {});
  console.log(JSON.stringify({ mkdirCalls, appendCalls, consoleCalls, statusCode: response.statusCode }));
`;

function runLoggingCheck(environment) {
  const childEnvironment = { ...process.env, ...environment };
  if (!Object.prototype.hasOwnProperty.call(environment, 'VERCEL')) delete childEnvironment.VERCEL;
  return spawnSync(process.execPath, ['-e', script], {
    cwd: backendDirectory,
    env: childEnvironment,
    encoding: 'utf8'
  });
}

test('production and Vercel errors use console without filesystem writes', () => {
  for (const environment of [
    { NODE_ENV: 'production' },
    { NODE_ENV: 'development', VERCEL: '1' }
  ]) {
    const result = runLoggingCheck(environment);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), {
      mkdirCalls: 0,
      appendCalls: 0,
      consoleCalls: 1,
      statusCode: 500
    });
  }
});

test('local development preserves file logging', () => {
  const result = runLoggingCheck({ NODE_ENV: 'development' });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    mkdirCalls: 1,
    appendCalls: 1,
    consoleCalls: 0,
    statusCode: 500
  });
});
