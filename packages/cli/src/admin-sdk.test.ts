import test from 'ava';
import os from 'os';
import path from 'path';
import fse from 'fs-extra';
import { overwriteSpace } from './admin-sdk';
import { WRITE_API_ROOT } from './overwrite';

const GRAPHQL_URL = 'https://cdn.builder.io/api/v2/admin';

const makeSnapshot = async (models: Record<string, { schema: any; entries: any[] }>) => {
  const dir = await fse.mkdtemp(path.join(os.tmpdir(), 'builder-overwrite-test-'));
  for (const [modelName, { schema, entries }] of Object.entries(models)) {
    const modelDir = path.join(dir, modelName);
    await fse.outputJson(path.join(modelDir, 'schema.model.json'), schema);
    for (const entry of entries) {
      await fse.outputJson(path.join(modelDir, `${entry.id || 'no-id'}.json`), entry);
    }
  }
  return dir;
};

/**
 * `createGraphqlClient`'s fetcher and the write-queue's `fetchImpl` both
 * resolve the bare `fetch` identifier at call time, so replacing
 * `global.fetch` intercepts every HTTP call `overwriteSpace` makes —
 * both the GraphQL admin API and the REST content write API.
 */
const withMockedFetch = async (
  handler: (url: string, init: any) => Promise<{ status: number; json?: any; text?: string }>,
  run: () => Promise<void>
) => {
  const calls: Array<{ url: string; init: any }> = [];
  const originalFetch = (global as any).fetch;
  const originalExit = process.exit;
  (global as any).fetch = async (url: string, init: any) => {
    calls.push({ url, init });
    const result = await handler(url, init);
    return {
      ok: result.status >= 200 && result.status < 300,
      status: result.status,
      json: async () => result.json,
      text: async () => (result.text !== undefined ? result.text : JSON.stringify(result.json ?? {})),
      headers: { get: () => null },
    };
  };
  let exitCode: number | undefined;
  (process as any).exit = (code?: number) => {
    exitCode = code;
    throw new Error(`process.exit(${code})`);
  };
  try {
    await run();
  } catch (e) {
    if (exitCode === undefined) {
      throw e;
    }
  } finally {
    (global as any).fetch = originalFetch;
    process.exit = originalExit;
  }
  return { calls, exitCode };
};

const graphqlResponse = (data: any) => ({ status: 200, json: { data } });

test.serial('prune only deletes entries that predate the run and existed in the destination', async t => {
  const dir = await makeSnapshot({
    posts: {
      schema: { name: 'Posts' },
      entries: [{ id: 'a', name: 'A' }],
    },
  });

  const { calls } = await withMockedFetch(
    async (url, init) => {
      if (url === GRAPHQL_URL) {
        const body = JSON.parse(init.body);
        if (body.query.includes('updateModel')) {
          return graphqlResponse({ updateModel: { id: 'model-1', name: 'Posts' } });
        }
        if (body.query.includes('downloadClone')) {
          const contentQueryVar = Object.values(body.variables)[0] as any;
          if (contentQueryVar.offset > 0) {
            return graphqlResponse({ downloadClone: { models: [] } });
          }
          return graphqlResponse({
            downloadClone: {
              models: [
                {
                  name: 'Posts',
                  content: [
                    { id: 'a', createdDate: 1 },
                    { id: 'stale', createdDate: 1 },
                  ],
                },
              ],
            },
          });
        }
        return graphqlResponse({ models: [{ id: 'model-1', name: 'Posts' }] });
      }
      if (url.startsWith(WRITE_API_ROOT)) {
        return { status: 200, text: '' };
      }
      throw new Error(`unexpected fetch to ${url}`);
    },
    () => overwriteSpace('fake-key', dir, false, true, true, false)
  );

  const writeUrls = calls
    .filter(c => c.url.startsWith(WRITE_API_ROOT) && c.init.method === 'PUT')
    .map(c => c.url);
  const deleteUrls = calls
    .filter(c => c.url.startsWith(WRITE_API_ROOT) && c.init.method === 'DELETE')
    .map(c => c.url);

  t.true(writeUrls.some(url => url.endsWith('/posts/a')));
  t.true(deleteUrls.some(url => url.endsWith('/posts/stale')));
  t.false(deleteUrls.some(url => url.endsWith('/posts/a')));

  const downloadCloneCall = calls.find(
    c => c.url === GRAPHQL_URL && JSON.parse(c.init.body).query.includes('downloadClone')
  );
  const contentQueryVar = Object.values(JSON.parse(downloadCloneCall!.init.body).variables)[0] as any;
  t.deepEqual(contentQueryVar.sort, { createdDate: 1 });
  t.truthy(contentQueryVar.query?.createdDate?.$lte);
  t.true(contentQueryVar.options?.includeUnpublished);
});

test.serial('prune is skipped entirely when a content write fails', async t => {
  const dir = await makeSnapshot({
    posts: {
      schema: { name: 'Posts' },
      entries: [{ id: 'a', name: 'A' }],
    },
  });

  const { calls, exitCode } = await withMockedFetch(
    async (url, init) => {
      if (url === GRAPHQL_URL) {
        const body = JSON.parse(init.body);
        if (body.query.includes('updateModel')) {
          return graphqlResponse({ updateModel: { id: 'model-1', name: 'Posts' } });
        }
        return graphqlResponse({ models: [{ id: 'model-1', name: 'Posts' }] });
      }
      if (url.startsWith(WRITE_API_ROOT) && init.method === 'PUT') {
        return { status: 400, text: 'bad request' };
      }
      throw new Error(`unexpected fetch to ${url}`);
    },
    () => overwriteSpace('fake-key', dir, false, true, true, false)
  );

  t.is(exitCode, 1);
  t.false(calls.some(c => c.url.startsWith(WRITE_API_ROOT) && c.init.method === 'DELETE'));
});

test.serial('refuses to update a model whose id no longer matches the snapshot', async t => {
  const dir = await makeSnapshot({
    posts: {
      schema: { id: 'original-model-id', name: 'Posts' },
      entries: [{ id: 'a', name: 'A' }],
    },
  });

  const { calls, exitCode } = await withMockedFetch(
    async (url, init) => {
      if (url === GRAPHQL_URL) {
        const body = JSON.parse(init.body);
        if (body.query.includes('updateModel')) {
          throw new Error('updateModel should not be called for a mismatched model id');
        }
        return graphqlResponse({ models: [{ id: 'recreated-model-id', name: 'Posts' }] });
      }
      throw new Error('unexpected fetch to ' + url);
    },
    () => overwriteSpace('fake-key', dir, false, false, true, false)
  );

  t.is(exitCode, 1);
  t.false(calls.some(c => c.url.startsWith(WRITE_API_ROOT)));
});

test.serial('a transient model mutation failure is retried instead of skipping the model', async t => {
  const dir = await makeSnapshot({
    posts: {
      schema: { name: 'Posts' },
      entries: [{ id: 'a', name: 'A' }],
    },
  });

  let updateModelCalls = 0;
  const { calls, exitCode } = await withMockedFetch(
    async (url, init) => {
      if (url === GRAPHQL_URL) {
        const body = JSON.parse(init.body);
        if (body.query.includes('updateModel')) {
          updateModelCalls++;
          if (updateModelCalls === 1) {
            return { status: 200, json: { errors: [{ message: 'transient error' }] } };
          }
          return graphqlResponse({ updateModel: { id: 'model-1', name: 'Posts' } });
        }
        return graphqlResponse({ models: [{ id: 'model-1', name: 'Posts' }] });
      }
      if (url.startsWith(WRITE_API_ROOT)) {
        return { status: 200, text: '' };
      }
      throw new Error('unexpected fetch to ' + url);
    },
    () => overwriteSpace('fake-key', dir, false, false, true, false)
  );

  t.is(updateModelCalls, 2);
  t.is(exitCode, undefined);
  t.true(calls.some(c => c.url.endsWith('/posts/a') && c.init.method === 'PUT'));
});

test.serial('dry-run makes no write, delete, or mutation calls', async t => {
  const dir = await makeSnapshot({
    posts: {
      schema: { name: 'Posts' },
      entries: [{ id: 'a', name: 'A' }],
    },
  });

  const { calls } = await withMockedFetch(
    async (url, init) => {
      if (url === GRAPHQL_URL) {
        const body = JSON.parse(init.body);
        if (body.query.includes('downloadClone')) {
          const contentQueryVar = Object.values(body.variables)[0] as any;
          if (contentQueryVar.offset > 0) {
            return graphqlResponse({ downloadClone: { models: [] } });
          }
          return graphqlResponse({
            downloadClone: { models: [{ name: 'Posts', content: [{ id: 'a', createdDate: 1 }] }] },
          });
        }
        return graphqlResponse({ models: [{ id: 'model-1', name: 'Posts' }] });
      }
      throw new Error(`unexpected mutating fetch to ${url}`);
    },
    () => overwriteSpace('fake-key', dir, false, true, true, true)
  );

  t.false(calls.some(c => c.url === GRAPHQL_URL && JSON.parse(c.init.body).query.includes('updateModel')));
  t.false(calls.some(c => c.url.startsWith(WRITE_API_ROOT)));
});
