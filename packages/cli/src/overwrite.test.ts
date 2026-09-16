import test from 'ava';
import { buildWriteRequest, planModelSync } from './overwrite';

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
