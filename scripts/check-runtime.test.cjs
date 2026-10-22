const assert = require('node:assert/strict');
const { test } = require('node:test');
const { assertSupportedRuntime } = require('./check-runtime.cjs');

test('今回の修正版と同系列の後続パッチを受け入れる', () => {
  for (const version of [
    '22.23.4',
    '22.23.5',
    '22.24.0',
    '24.22.1',
    '26.12.1',
  ]) {
    assert.doesNotThrow(() => assertSupportedRuntime(version));
  }
});

test('修正前・サポート終了・未知のメジャーを拒否する', () => {
  for (const version of [
    '18.15.0',
    '20.19.2',
    '22.15.1',
    '22.23.3',
    '24.22.0',
    '26.12.0',
    '23.11.0',
    '27.0.0',
  ]) {
    assert.throws(() => assertSupportedRuntime(version));
  }
});

test('不完全な版やプレリリースを安全な版として扱わない', () => {
  for (const version of ['', '22', '22.23', '22.23.4-rc.1', 'invalid']) {
    assert.throws(() => assertSupportedRuntime(version));
  }
});
