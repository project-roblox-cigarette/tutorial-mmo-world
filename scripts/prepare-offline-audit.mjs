import { createHash } from 'node:crypto';
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const cache = path.join(root, 'node_modules/.cache/dependency-security');
const releases = {
  'win32/x64': [
    'osv-scanner_windows_amd64.exe',
    '9964ed64ec9a387391eb4cc006ad5c531154821aef29b793e02c448de4686438',
  ],
  'linux/x64': [
    'osv-scanner_linux_amd64',
    '160c6253e2922e9e0a6a9771c5c4c40a4b3c6090b34a3cdd5e80c96cc2e4218b',
  ],
};
const release = releases[`${process.platform}/${process.arch}`];
if (!release)
  throw new Error(
    'No verified OSV v2.7.0 binary configured for this platform.',
  );
async function download(url) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Official public download failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
await mkdir(cache, { recursive: true });
const binary = await download(
  `https://github.com/google/osv-scanner/releases/download/v2.7.0/${release[0]}`,
);
if (createHash('sha256').update(binary).digest('hex') !== release[1])
  throw new Error('Official OSV v2.7.0 checksum mismatch.');
const scanner = path.join(
  cache,
  process.platform === 'win32' ? 'osv-scanner.exe' : 'osv-scanner',
);
await writeFile(scanner, binary);
if (process.platform !== 'win32') await chmod(scanner, 0o700);
let hasComposer = false;
try {
  await readFile(path.join(root, 'composer.lock'));
  hasComposer = true;
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
for (const ecosystem of ['npm', ...(hasComposer ? ['Packagist'] : [])]) {
  const folder = path.join(cache, 'database/osv-scalibr', ecosystem);
  await mkdir(folder, { recursive: true });
  await writeFile(
    path.join(folder, 'all.zip'),
    await download(
      `https://osv-vulnerabilities.storage.googleapis.com/${ecosystem}/all.zip`,
    ),
  );
}
console.log(
  'Verified offline scanner and full public vulnerability databases prepared. No project data was uploaded.',
);
