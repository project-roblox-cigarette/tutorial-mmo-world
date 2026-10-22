const { test } = require('node:test');
const assert = require('node:assert/strict');
const { verifyRuntime } = require('./check-runtime.cjs');
test('accept only the reviewed Node and pnpm versions', () => {
  assert.doesNotThrow(() =>
    verifyRuntime('22.23.4', 'pnpm/12.14.0 npm/? node/v22.23.4 win32 x64'),
  );
});
test('reject vulnerable or unreviewed Node versions', () => {
  for (const version of [
    '20.20.0',
    '22.23.3',
    '24.22.0',
    '26.12.0',
    '22.23.5',
  ]) {
    assert.throws(
      () => verifyRuntime(version, 'pnpm/12.14.0'),
      /runtime is not approved/,
    );
  }
});
test('reject npm and unreviewed package-manager versions', () => {
  for (const agent of [
    'npm/11.0.0',
    'yarn/4.0.0',
    'pnpm/11.28.5',
    'pnpm/12.14.1',
    undefined,
  ]) {
    assert.throws(() => verifyRuntime('22.23.4', agent), /not approved/);
  }
});
