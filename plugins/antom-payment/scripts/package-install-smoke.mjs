import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Run this check with npm run test:package.');
const temporary = await mkdtemp(path.join(await realpath(tmpdir()), 'antom-package-smoke-'));

try {
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.bin, undefined, 'Retired installers must not be published.');
  const result = spawnSync(process.execPath, [npmCli, 'pack', '--ignore-scripts', '--json',
    '--pack-destination', temporary, '--cache', path.join(temporary, 'npm-cache')], {
    cwd: root, encoding: 'utf8', timeout: 60_000, maxBuffer: 2 * 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  const packed = JSON.parse(result.stdout)[0];
  assert.deepEqual(packed.files.map(file => file.path).sort(), [
    'LICENSE', 'README.md', 'package.json',
    'dist/plugin.system.js', 'dist/plugin.system.js.LICENSE.txt',
    'docs/media/builder-installation.png', 'docs/media/antom-integration-demo.gif',
  ].sort(), 'Publish only the browser plugin, dependency notices and user guide media.');
  assert.equal(packed.name, pkg.name);
  assert.equal(packed.version, pkg.version);
  console.log(`Package smoke passed: ${packed.files.length} allowlisted files; no CLI, settings, Skill archives or credentials. Builder acceptance is a separate check.`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
