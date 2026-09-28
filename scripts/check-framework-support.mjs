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
const normalize = value => value.replaceAll('\\|', '|').replaceAll(/\s+/g, '');

for (const row of rows) {
  const name = row.match(/^\| \[`([^`]+)`\]/)?.[1];
  assert.ok(packages.has(name), `Unexpected SDK in framework matrix: ${name}`);
  assert.ok(!seen.has(name), `Duplicate SDK in framework matrix: ${name}`);
  seen.add(name);

  const cells = row
    .slice(1, -1)
    .split(/(?<!\\)\|/)
    .map(cell => cell.trim());
  assert.equal(cells.length, 4, `Expected four columns for ${name}`);
  const [path, peers, evidence, active] = cells;
  const [manifestPath, frameworkPeers] = packages.get(name);
  const manifest = JSON.parse(readFileSync(new URL(manifestPath, root), 'utf8'));
  assert.ok(path.includes(`\`${name}\``), `Missing package name for ${name}`);
  assert.ok(peers && evidence && active, `Incomplete framework guidance for ${name}`);

  for (const peer of frameworkPeers) {
    const range = manifest.peerDependencies[peer];
    assert.ok(
      range && semver.validRange(range),
      `Missing framework peer ${peer} in ${manifestPath}`
    );
    assert.ok(
      normalize(peers).includes(normalize(range)),
      `Documented framework range for ${name} is out of sync with ${peer}: ${range}`
    );
  }

  if (active === 'Pending') continue;

  assert.match(active, /\[test\]\([^)]+\)/, `Active minimum for ${name} needs a passing test link`);
  assert.match(active, /\[approval\]\([^)]+\)/, `Active minimum for ${name} needs owner approval`);
  const versions = new Map(
    [...active.matchAll(/`([^`]+)@(\d+\.\d+\.\d+)`/g)].map(match => [match[1], match[2]])
  );
  for (const peer of frameworkPeers) {
    assert.ok(versions.has(peer), `Active minimum for ${name} must include ${peer}`);
    assert.ok(
      semver.satisfies(versions.get(peer), manifest.peerDependencies[peer]),
      `Active minimum for ${name} does not satisfy ${peer}'s peer range`
    );
  }
}

assert.equal(seen.size, packages.size, 'Framework matrix must include every framework-facing SDK');
console.log(`Validated ${seen.size} framework SDK entries`);
