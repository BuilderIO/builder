import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import semver from 'semver';

const packages = new Map([
  ['@builder.io/react', ['packages/react/package.json', ['react', 'react-dom']]],
  ['@builder.io/angular', ['packages/angular/package.json', []]],
  ['@builder.io/gatsby', ['packages/gatsby/package.json', ['gatsby']]],
  ['@builder.io/widgets', ['packages/widgets/package.json', ['react', 'react-dom', 'next']]],
  ['@builder.io/sdk-react', ['packages/sdks/output/react/package.json', ['react']]],
  [
    '@builder.io/sdk-react-native',
    ['packages/sdks/output/react-native/package.json', ['react', 'react-dom', 'react-native']],
  ],
  ['@builder.io/sdk-vue', ['packages/sdks/output/vue/package.json', ['vue']]],
  [
    '@builder.io/sdk-angular',
    ['packages/sdks/output/angular/package.json', ['@angular/core', '@angular/common']],
  ],
  ['@builder.io/sdk-svelte', ['packages/sdks/output/svelte/package.json', ['svelte']]],
  ['@builder.io/sdk-solid', ['packages/sdks/output/solid/package.json', ['solid-js']]],
  ['@builder.io/sdk-qwik', ['packages/sdks/output/qwik/package.json', ['@builder.io/qwik']]],
  [
    '@builder.io/sdk-react-nextjs',
    ['packages/sdks/output/nextjs/package.json', ['next', 'react', 'react-dom']],
  ],
]);

const root = new URL('../', import.meta.url);
const matrix = readFileSync(new URL('packages/sdks/README.md', root), 'utf8');
const rows = matrix.split('\n').filter(line => line.startsWith('| [`@builder.io/'));
const seen = new Set();
for (const row of rows) {
  const name = row.match(/^\| \[`([^`]+)`\]/)?.[1];
  assert.ok(packages.has(name), `Unexpected SDK in framework matrix: ${name}`);
  assert.ok(!seen.has(name), `Duplicate SDK in framework matrix: ${name}`);
  seen.add(name);

  const cells = row
    .slice(1, -1)
    .split(/(?<!\\)\|/)
    .map(cell => cell.trim());
  assert.equal(cells.length, 2, `Expected two columns for ${name}`);
  const [path, supported] = cells;
  const [manifestPath, frameworkPeers] = packages.get(name);
  const manifest = JSON.parse(readFileSync(new URL(manifestPath, root), 'utf8'));
  assert.ok(path.includes(`\`${name}\``), `Missing package name for ${name}`);
  assert.ok(supported, `Incomplete framework guidance for ${name}`);

  for (const peer of frameworkPeers) {
    const range = manifest.peerDependencies[peer];
    assert.ok(
      range && semver.validRange(range),
      `Missing framework peer ${peer} in ${manifestPath}`
    );
  }

  if (supported.startsWith('Not verified')) continue;

  assert.match(
    supported,
    /\]\(\.[^)]*\/package\.json\)/,
    `Minimum for ${name} needs an E2E fixture link`
  );
  const versions = [...supported.matchAll(/`([^`]+)@(\d+\.\d+\.\d+)`/g)];
  for (const peer of frameworkPeers) {
    const peerVersions = versions.filter(match => match[1] === peer);
    assert.ok(peerVersions.length, `Minimum for ${name} must include ${peer}`);
    for (const [, , version] of peerVersions) {
      assert.ok(
        semver.satisfies(version, manifest.peerDependencies[peer]),
        `Minimum ${peer}@${version} for ${name} does not satisfy its peer range`
      );
    }
  }
}

assert.equal(seen.size, packages.size, 'Framework matrix must include every framework-facing SDK');
console.log(`Validated ${seen.size} framework SDK entries`);
