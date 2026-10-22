const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { assertSupportedRuntime } = require('./check-runtime.cjs');

assertSupportedRuntime();
const root = path.resolve(__dirname, '..');
const gameRoot = path.join(root, 'apps/game');
const runner = process.env.RUN_IN_ROBLOX || 'run-in-roblox';

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    timeout: 120_000,
    maxBuffer: 4 * 1024 * 1024,
  });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command}: exit ${result.status}`);
  return result.stdout;
}

// 本番server/clientを含めず、既存の共有モジュールとspecだけを配置する。
const source = require('../apps/game/default.project.json');
const storage = source.tree.ReplicatedStorage;
storage.rbxts_include.$path = path.join(gameRoot, 'include');
storage.rbxts_include.node_modules['@rbxts'].$path = path.join(
  gameRoot,
  'node_modules/@rbxts',
);
storage.Shared.$path = path.join(gameRoot, 'out/shared');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'tutorial-testez-'));
if (
  path.dirname(temp) !== path.resolve(os.tmpdir()) ||
  !path.basename(temp).startsWith('tutorial-testez-')
) {
  throw new Error('Unexpected TestEZ temporary directory');
}
try {
  const version = run(runner, ['--version']).trim();
  if (version !== 'run-in-roblox 0.3.0') {
    throw new Error('run-in-roblox 0.3.0を使用してください');
  }
  const project = path.join(temp, 'test.project.json');
  const place = path.join(temp, 'test.rbxlx');
  const script = path.join(temp, 'run.luau');
  fs.writeFileSync(
    project,
    JSON.stringify({
      name: 'tutorial-testez',
      tree: { $className: 'DataModel', ReplicatedStorage: storage },
    }),
  );
  fs.writeFileSync(
    script,
    `local storage = game:GetService("ReplicatedStorage")
local TestEZ = require(storage.rbxts_include.node_modules["@rbxts"].testez.src)
local shared = storage:WaitForChild("Shared")
local modules = TestEZ.TestBootstrap:getModules(shared)
assert(#modules > 0, "No TestEZ specs were discovered")
local results = TestEZ.TestBootstrap:run({ shared })
local errors = #results.errors
results:visitAllNodes(function(node)
    errors += #node.errors
end)
assert(results.failureCount == 0 and errors == 0, "TestEZ failed")
assert(results.successCount > 0, "No TestEZ tests ran")
print("TESTEZ_RESULT " .. game:GetService("HttpService"):JSONEncode({
    modules = #modules,
    passed = results.successCount,
    failed = results.failureCount,
    skipped = results.skippedCount,
    errors = errors,
}))
`,
  );
  run(process.execPath, [
    require.resolve('rojo'),
    'build',
    project,
    '-o',
    place,
  ]);
  const output = run(runner, ['--place', place, '--script', script]);
  // 接続失敗時などの終了コードだけで合格にしない。
  const marker = /^TESTEZ_RESULT (\{[^\r\n]+\})\r?$/m.exec(output);
  if (!marker) throw new Error('TestEZの完了結果を取得できませんでした');
  const result = JSON.parse(marker[1]);
  if (
    !(result.modules > 0 && result.passed > 0) ||
    result.failed !== 0 ||
    result.errors !== 0
  ) {
    throw new Error('TestEZの成功条件を満たしていません');
  }
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
