import test from 'ava';
import os from 'os';
import path from 'path';
import fse from 'fs-extra';
import {
  BUILDER_PRIVATE_KEY_ENV_VAR,
  confirmAction,
  getDirectories,
  getFiles,
  isAffirmativeAnswer,
  resolvePrivateKey,
} from './utils';

test('getDirectories excludes hidden directories like .git or .vscode', async t => {
  const dir = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-hidden-test-'));
  await fse.ensureDir(path.join(dir, '.vscode'));
  await fse.ensureDir(path.join(dir, 'posts'));

  const dirs = (await getDirectories(dir)).map(d => d.name);

  t.deepEqual(dirs, ['posts']);
});

test('getFiles excludes hidden files like .DS_Store', async t => {
  const dir = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-hidden-test-'));
  await fse.outputFile(path.join(dir, '.DS_Store'), 'junk');
  await fse.outputJson(path.join(dir, 'entry-id-a.json'), { id: 'a' });

  const files = (await getFiles(dir)).map(f => f.name);

  t.deepEqual(files, ['entry-id-a.json']);
});

test('isAffirmativeAnswer accepts yes/y case-insensitively', t => {
  t.true(isAffirmativeAnswer('yes'));
  t.true(isAffirmativeAnswer('Yes'));
  t.true(isAffirmativeAnswer('YES'));
  t.true(isAffirmativeAnswer('y'));
  t.true(isAffirmativeAnswer('Y'));
  t.true(isAffirmativeAnswer('  yes  '));
});

test('isAffirmativeAnswer rejects anything else', t => {
  t.false(isAffirmativeAnswer('no'));
  t.false(isAffirmativeAnswer('n'));
  t.false(isAffirmativeAnswer(''));
  t.false(isAffirmativeAnswer('yep'));
  t.false(isAffirmativeAnswer('sure'));
});

test('confirmAction resolves true only for an affirmative response', async t => {
  t.true(await confirmAction('proceed? ', async () => 'yes'));
  t.false(await confirmAction('proceed? ', async () => 'no'));
  t.false(await confirmAction('proceed? ', async () => ''));
});

test('confirmAction passes the question through to the prompt', async t => {
  let seenQuestion = '';
  await confirmAction('delete everything? ', async question => {
    seenQuestion = question;
    return 'yes';
  });
  t.is(seenQuestion, 'delete everything? ');
});

test('resolvePrivateKey prefers the flag value over the env var', t => {
  t.is(
    resolvePrivateKey('flag-key', { [BUILDER_PRIVATE_KEY_ENV_VAR]: 'env-key' }),
    'flag-key'
  );
});

test('resolvePrivateKey falls back to the env var when no flag is passed', t => {
  t.is(resolvePrivateKey(undefined, { [BUILDER_PRIVATE_KEY_ENV_VAR]: 'env-key' }), 'env-key');
});

test('resolvePrivateKey returns undefined when neither is set', t => {
  t.is(resolvePrivateKey(undefined, {}), undefined);
});

test('resolvePrivateKey ignores an empty flag value', t => {
  t.is(resolvePrivateKey('', { [BUILDER_PRIVATE_KEY_ENV_VAR]: 'env-key' }), 'env-key');
});
