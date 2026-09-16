import test from 'ava';
import { buildDeleteRequest, buildWriteRequest, findStaleEntryIds, planModelSync } from './overwrite';

test('matches an existing model by kebab-cased name', t => {
  const existing = [
    { id: 'model-1', name: 'Blog Post' },
    { id: 'model-2', name: 'page' },
  ];

  t.deepEqual(planModelSync(existing, 'blog-post'), { action: 'update', existingId: 'model-1' });
  t.deepEqual(planModelSync(existing, 'page'), { action: 'update', existingId: 'model-2' });
});

test('plans to create a model with no match in the target space', t => {
  const existing = [{ id: 'model-1', name: 'Blog Post' }];
  t.deepEqual(planModelSync(existing, 'symbol'), { action: 'create' });
});

test('plans to create when the target space has no models', t => {
  t.deepEqual(planModelSync([], 'page'), { action: 'create' });
});

test('an entry with an id is upserted via PUT to its own url', t => {
  t.deepEqual(buildWriteRequest('page', { id: 'abc123' }), {
    method: 'PUT',
    url: 'https://builder.io/api/v1/write/page/abc123',
  });
});

test('an entry without an id falls back to creating via POST', t => {
  t.deepEqual(buildWriteRequest('page', {}), {
    method: 'POST',
    url: 'https://builder.io/api/v1/write/page',
  });
  t.deepEqual(buildWriteRequest('page', { id: null }), {
    method: 'POST',
    url: 'https://builder.io/api/v1/write/page',
  });
});

test('buildDeleteRequest targets the entry by id', t => {
  t.deepEqual(buildDeleteRequest('page', 'abc123'), {
    method: 'DELETE',
    url: 'https://builder.io/api/v1/write/page/abc123',
  });
});

test('ids and model names with url-unsafe characters are encoded', t => {
  t.deepEqual(buildWriteRequest('page', { id: 'a/b c' }), {
    method: 'PUT',
    url: 'https://builder.io/api/v1/write/page/a%2Fb%20c',
  });
  t.deepEqual(buildDeleteRequest('page', 'a/b c'), {
    method: 'DELETE',
    url: 'https://builder.io/api/v1/write/page/a%2Fb%20c',
  });
});

test('findStaleEntryIds returns ids not present in the snapshot', t => {
  const existing = [{ id: 'keep-1' }, { id: 'stale-1' }, { id: 'keep-2' }, { id: 'stale-2' }];
  const keepIds = new Set(['keep-1', 'keep-2']);

  t.deepEqual(findStaleEntryIds(existing, keepIds), ['stale-1', 'stale-2']);
});

test('findStaleEntryIds ignores entries without an id', t => {
  const existing = [{ id: 'keep-1' }, {}, { id: null }];
  t.deepEqual(findStaleEntryIds(existing, new Set(['keep-1'])), []);
});

test('findStaleEntryIds treats an empty keep set as delete everything with an id', t => {
  const existing = [{ id: 'a' }, { id: 'b' }];
  t.deepEqual(findStaleEntryIds(existing, new Set()), ['a', 'b']);
});
