import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const cache = path.join(root, 'node_modules/.cache/dependency-security');
const scanner =
  process.env.OSV_SCANNER_PATH ??
  path.join(
    cache,
    process.platform === 'win32' ? 'osv-scanner.exe' : 'osv-scanner',
  );
const database = process.env.OSV_LOCAL_DB_PATH ?? path.join(cache, 'database');
const hashes = {
  'win32/x64':
    '9964ed64ec9a387391eb4cc006ad5c531154821aef29b793e02c448de4686438',
  'linux/x64':
    '160c6253e2922e9e0a6a9771c5c4c40a4b3c6090b34a3cdd5e80c96cc2e4218b',
};
function fail(message) {
  console.error(message);
  process.exit(2);
}
if (!existsSync(scanner) || !existsSync(database))
  fail(
    'Run node scripts/prepare-offline-audit.mjs, or set OSV_SCANNER_PATH and OSV_LOCAL_DB_PATH. No dependency list is sent to an audit API.',
  );
if (
  createHash('sha256').update(readFileSync(scanner)).digest('hex') !==
  hashes[`${process.platform}/${process.arch}`]
)
  fail('OSV scanner must match the official v2.7.0 checksum.');
mkdirSync(cache, { recursive: true });
function scan(files, output) {
  const args = [
    'scan',
    'source',
    '--offline',
    '--local-db-path',
    database,
    '--format',
    'json',
    ...files.flatMap((file) => ['--lockfile', file]),
    '--output-file',
    output,
  ];
  const result = spawnSync(scanner, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
  });
  if (result.error || ![0, 1].includes(result.status))
    fail(
      `Offline scanner error: ${result.error?.message ?? result.stderr ?? result.status}`,
    );
  const counts = [
    ...(result.stderr + '\n' + result.stdout).matchAll(
      /found (\d+) packages?/g,
    ),
  ].map((match) => Number(match[1]));
  if (counts.length < files.length || counts.some((count) => count === 0))
    fail(
      'The scanner did not recognize every lockfile; refusing an empty clean audit.',
    );
  const report = JSON.parse(readFileSync(output, 'utf8'));
  return { status: result.status, report, counts };
}
const controls = mkdtempSync(path.join(tmpdir(), 'osv-control-'));
process.on('exit', () => rmSync(controls, { recursive: true, force: true }));
const npmControl = path.join(controls, 'package-lock.json');
writeFileSync(
  npmControl,
  JSON.stringify({
    name: 'offline-audit-positive-control',
    lockfileVersion: 3,
    packages: {
      'node_modules/sharp': {
        name: 'sharp',
        version: '0.34.5',
        resolved: 'https://registry.npmjs.org/sharp/-/sharp-0.34.5.tgz',
      },
    },
  }),
);
const hasComposer = existsSync(path.join(root, 'composer.lock'));
const fixtures = [npmControl];
if (hasComposer) {
  const composerControl = path.join(controls, 'composer.lock');
  writeFileSync(
    composerControl,
    JSON.stringify({
      packages: [{ name: 'laravel/framework', version: 'v10.0.3' }],
      'packages-dev': [],
    }),
  );
  fixtures.push(composerControl);
}
let control;
control = scan(fixtures, path.join(controls, 'result.json'));
const recognized = (name, version) =>
  control.report.results?.some((source) =>
    source.packages?.some(
      (entry) =>
        entry.package?.name === name &&
        entry.package?.version?.replace(/^v/, '') === version &&
        entry.vulnerabilities?.length,
    ),
  );
if (
  control.status !== 1 ||
  !recognized('sharp', '0.34.5') ||
  (hasComposer && !recognized('laravel/framework', '10.0.3'))
)
  fail('Offline database positive control failed.');
const locks = [
  path.join(root, 'pnpm-lock.yaml'),
  ...(hasComposer ? [path.join(root, 'composer.lock')] : []),
];
const output = path.join(cache, 'result.json');
const result = scan(locks, output);
for (const source of result.report.results ?? [])
  for (const entry of source.packages ?? [])
    for (const issue of entry.vulnerabilities ?? [])
      console.log(
        `${entry.package.name}@${entry.package.version}: ${issue.id}`,
      );
console.log(
  `Recognized package counts: ${result.counts.join(', ')}; raw offline report: ${output}`,
);
// Keep raw findings visible even for versions carrying local mitigation patches.
process.exit(result.status);
