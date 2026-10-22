const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
);
function verifyRuntime(nodeVersion, userAgent) {
  assert.equal(
    nodeVersion,
    manifest.devEngines.runtime.version,
    `Use the verified Node.js ${manifest.devEngines.runtime.version}; this runtime is not approved.`,
  );
  const expected = manifest.packageManager.replace('@', '/');
  assert.ok(
    typeof userAgent === 'string' && userAgent.split(' ')[0] === expected,
    `Use ${manifest.packageManager}. npm, yarn, and other pnpm versions are not approved.`,
  );
}
if (require.main === module) {
  verifyRuntime(process.versions.node, process.env.npm_config_user_agent);
  console.log(
    `Verified Node.js ${process.versions.node} / ${manifest.packageManager}`,
  );
}
module.exports = { verifyRuntime };
