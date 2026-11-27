/**
 * Builds `src/` for the Svelte 5 SDK. It does what Mitosis does for the other targets, minus the
 * component compilation:
 *
 * 1. Copy the framework-agnostic TypeScript from `packages/sdks/src` (fetching, evaluation,
 *    tracking, editor protocol, CSS, A/B tests…), so the logic stays shared with every other SDK.
 * 2. Point every import of a Mitosis component (`*.lite.jsx`) at the hand-written Svelte 5
 *    component of the same name (`*.svelte`), and every Mitosis context (`*.lite.js`) at its `.js`
 *    replacement.
 * 3. Overlay `packages/sdks/overrides/svelte5/src`: the Svelte 5 components (runes, snippets, no
 *    stores, no legacy syntax) and the few target-specific TypeScript files.
 *
 * `src/` is generated (gitignored); edit the shared source or the overrides instead.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PKG = path.resolve(HERE, '..');
const SDKS = path.resolve(PKG, '../..');
const SHARED_SRC = path.join(SDKS, 'src');
const OVERRIDES = path.join(SDKS, 'overrides/svelte5/src');
const OUT = path.join(PKG, 'src');

const isSharedTs = (file) =>
  file.endsWith('.ts') &&
  !file.endsWith('.test.ts') &&
  !file.endsWith('.lite.ts') &&
  !file.endsWith('.d.ts');

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__snapshots__') continue;
      walk(full, visit);
    } else {
      visit(full);
    }
  }
}

function rewrite(code, relFile) {
  const toRoot =
    path.posix.relative(path.posix.dirname(relFile), '.') || '.';
  return (
    code
      // Mitosis' `Signal<T>` is the reactive context handle; in Svelte 5 it is a store-compatible
      // reactive object (see `types/signal.ts`).
      .replace(
        /import type \{ Signal \} from '@builder\.io\/mitosis';/g,
        `import type { Signal } from '${toRoot}/types/signal.js';`
      )
      // Type-only imports of a Mitosis component's props move to a `.types.ts` sibling.
      .replace(
        /(import type [^;]+? from '[^']+?)\.lite(?:\.jsx)?';/g,
        "$1.types.js';"
      )
      // Components → the Svelte 5 components; contexts → their plain-TS replacements.
      .replace(/\.lite\.jsx'/g, ".svelte'")
      .replace(/\.lite\.js'/g, ".js'")
  );
}

fs.rmSync(OUT, { recursive: true, force: true });

let shared = 0;
walk(SHARED_SRC, (file) => {
  if (!isSharedTs(file)) return;
  const rel = path.relative(SHARED_SRC, file).split(path.sep).join('/');
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, rewrite(fs.readFileSync(file, 'utf8'), rel));
  shared++;
});

// What `scripts/set-sdk-version.sh` does for the Mitosis SDKs: the version sent with API calls.
const { version } = JSON.parse(fs.readFileSync(path.join(PKG, 'package.json'), 'utf8'));
fs.writeFileSync(
  path.join(OUT, 'constants/sdk-version.ts'),
  `export const SDK_VERSION = ${JSON.stringify(version)};\n`
);

let overridden = 0;
walk(OVERRIDES, (file) => {
  const rel = path.relative(OVERRIDES, file);
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(file, dest);
  overridden++;
});

console.log(
  `[sdk-svelte5] src/: ${shared} shared files, ${overridden} Svelte 5 overrides`
);
