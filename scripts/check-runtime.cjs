const { engines } = require('../package.json');

// package.jsonの修正済み系列だけを受け入れ、将来の同系列パッチも許可する。
function supportsRuntime(version) {
  const current = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!current) return false;
  const [, major, minor, patch] = current.map(Number);
  return engines.node.split(' || ').some((range) => {
    const minimum = /^\^(\d+)\.(\d+)\.(\d+)$/.exec(range);
    if (!minimum) throw new Error('Node.jsの許可範囲を確認してください');
    const [, allowedMajor, allowedMinor, allowedPatch] = minimum.map(Number);
    return (
      major === allowedMajor &&
      (minor > allowedMinor ||
        (minor === allowedMinor && patch >= allowedPatch))
    );
  });
}

function assertSupportedRuntime(version = process.versions.node) {
  if (!supportsRuntime(version)) {
    throw new Error(
      `Node.js ${version}は対象外です。22.23.4、24.22.1、26.12.1以降の各系列を使用してください`,
    );
  }
}

if (require.main === module) {
  assertSupportedRuntime();
  console.log(`Node.js ${process.versions.node}: セキュリティ最低版を確認`);
}

module.exports = { assertSupportedRuntime, supportsRuntime };
