import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { bundledPackageRoots, renderNotices } = require('../scripts/third-party-notices.cjs');

test('notice collector traverses chunk and concatenated modules, excluding unused modules', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'antom-notices-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const directory = path.join(root, 'node_modules', 'fixture');
  await mkdir(path.join(directory, 'esm'), { recursive: true });
  await writeFile(path.join(directory, 'package.json'), JSON.stringify({ name: 'fixture', version: '1.0.0', license: 'MIT' }));
  await writeFile(path.join(directory, 'esm/package.json'), '{"type":"module"}');
  const module = { resource: path.join(directory, 'esm/index.js') };
  const compilation = {
    chunks: [{}], modules: [{ resource: path.join(root, 'node_modules/unused/index.js') }],
    chunkGraph: { getChunkModulesIterable: () => [{ modules: [module, module] }, { resource: path.join(root, 'src/index.js') }] },
  };
  assert.deepEqual(bundledPackageRoots(compilation), [directory]);
  assert.throws(() => renderNotices([directory]), /Missing license text/);
  await writeFile(path.join(directory, 'LICENSE'), '');
  assert.throws(() => renderNotices([directory]), /Empty notice/);
  const original = 'Copyright fixture\r\nFull license text\r\n';
  await writeFile(path.join(directory, 'LICENSE'), original);
  await writeFile(path.join(directory, 'NOTICE'), 'Additional attribution\n');
  const notices = renderNotices([directory]);
  assert.ok(notices.includes(original), 'Preserve upstream text without reformatting');
  assert.match(notices, /Additional attribution/);
  assert.ok(!notices.includes(root));
});

test('production notices contain full texts for every currently bundled dependency', async () => {
  const names = [
    '@babel/runtime', '@material-ui/core', '@material-ui/styles', '@material-ui/system', '@material-ui/utils',
    'clsx', 'css-vendor', 'hoist-non-react-statics', 'hyphenate-style-name', 'is-in-browser', 'jss',
    'jss-plugin-camel-case', 'jss-plugin-default-unit', 'jss-plugin-global', 'jss-plugin-nested',
    'jss-plugin-props-sort', 'jss-plugin-rule-value-function', 'jss-plugin-vendor-prefixer',
    'react-is', 'react-transition-group',
  ];
  // react-is is nested under hoist-non-react-statics; the root copy belongs to
  // external/test dependencies and is not the version bundled by this plugin.
  const hoistRequire = createRequire(require.resolve('hoist-non-react-statics'));
  const roots = names.map(name => path.dirname(
    (name === 'react-is' ? hoistRequire : require).resolve(name + '/package.json')));
  const notices = await readFile(new URL('../dist/plugin.system.js.LICENSE.txt', import.meta.url), 'utf8');
  assert.ok(notices.includes(renderNotices(roots)));
  assert.equal((notices.match(/^=== /gm) || []).length, names.length);
  assert.match(notices, /Copyright \(c\) 2016-2019 Jared Anderson/);
  assert.match(notices, /Neither the name/);
  assert.doesNotMatch(notices, /\/Users\/|\\Users\\|=== webpack@|=== @builder.io\/react@/);
});
