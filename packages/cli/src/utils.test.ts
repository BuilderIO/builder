import test from 'ava';
import { confirmAction, isAffirmativeAnswer } from './utils';

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
