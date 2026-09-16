import test from 'ava';
import {
  clampPageSize,
  downloadAllSpaceContent,
  FetchSpacePage,
  MAX_CONTENT_PAGE_SIZE,
  SpacePage,
} from './pagination';

const makeEntries = (model: string, from: number, count: number) =>
  Array.from({ length: count }, (_, i) => ({ id: `${model}-${from + i}`, name: `entry ${from + i}` }));

/**
 * Stands in for `downloadClone`: every model is sliced by the same limit/offset.
 */
const fakeApi = (modelSizes: Record<string, number>) => {
  const calls: Array<{ limit: number; offset: number }> = [];
  const fetchPage: FetchSpacePage = async ({ limit, offset }) => {
    calls.push({ limit, offset });
    const models = Object.keys(modelSizes).map(name => {
      const all = makeEntries(name, 0, modelSizes[name]);
      return {
        name,
        everything: { name, content: [] },
        content: all.slice(offset, offset + limit),
      };
    });
    return {
      settings: { name: 'my space', id: 'space-1' },
      meta: {
        contentIdMap: models.reduce<Record<string, string>>((map, model) => {
          model.content.forEach(entry => {
            map[entry.id] = entry.id;
          });
          return map;
        }, {}),
      },
      models,
    } as SpacePage;
  };
  return { fetchPage, calls };
};

test('clampPageSize caps at the content API maximum', t => {
  t.is(clampPageSize(50), 50);
  t.is(clampPageSize(100), 100);
  t.is(clampPageSize(5000), MAX_CONTENT_PAGE_SIZE);
  t.is(clampPageSize(0), MAX_CONTENT_PAGE_SIZE);
  t.is(clampPageSize(-10), MAX_CONTENT_PAGE_SIZE);
  t.is(clampPageSize(undefined), MAX_CONTENT_PAGE_SIZE);
  t.is(clampPageSize(NaN), MAX_CONTENT_PAGE_SIZE);
  t.is(clampPageSize(12.9), 12);
});

test('downloads every page, not just the first', async t => {
  const { fetchPage, calls } = fakeApi({ page: 250 });
  const space = await downloadAllSpaceContent(fetchPage, { pageSize: 100 });

  t.is(space.models.length, 1);
  t.is(space.models[0].content.length, 250);
  t.deepEqual(
    calls.map(call => call.offset),
    [0, 100, 200]
  );
  t.is(space.models[0].content[0].id, 'page-0');
  t.is(space.models[0].content[249].id, 'page-249');
});

test('a single short page stops after one request', async t => {
  const { fetchPage, calls } = fakeApi({ page: 7 });
  const space = await downloadAllSpaceContent(fetchPage, { pageSize: 100 });

  t.is(calls.length, 1);
  t.is(space.models[0].content.length, 7);
});

test('keeps paging while any model still has entries', async t => {
  const { fetchPage, calls } = fakeApi({ page: 230, symbol: 3, section: 101 });
  const space = await downloadAllSpaceContent(fetchPage, { pageSize: 100 });

  const byName = space.models.reduce<Record<string, number>>((counts, model) => {
    counts[model.name] = model.content.length;
    return counts;
  }, {});
  t.deepEqual(byName, { page: 230, symbol: 3, section: 101 });
  t.is(calls.length, 3);
});

test('an exactly-full last page still terminates', async t => {
  const { fetchPage, calls } = fakeApi({ page: 200 });
  const space = await downloadAllSpaceContent(fetchPage, { pageSize: 100 });

  t.is(space.models[0].content.length, 200);
  t.is(calls.length, 3);
});

test('requested page size above the api cap is clamped', async t => {
  const { fetchPage, calls } = fakeApi({ page: 150 });
  const space = await downloadAllSpaceContent(fetchPage, { pageSize: 100000 });

  t.true(calls.every(call => call.limit === MAX_CONTENT_PAGE_SIZE));
  t.is(space.models[0].content.length, 150);
});

test('merges clone id maps from every page', async t => {
  const { fetchPage } = fakeApi({ page: 150 });
  const space = await downloadAllSpaceContent(fetchPage, { pageSize: 100 });

  t.is(Object.keys(space.meta.contentIdMap).length, 150);
  t.is(space.meta.contentIdMap['page-149'], 'page-149');
});

test('settings are preserved from the first page', async t => {
  const { fetchPage } = fakeApi({ page: 120 });
  const space = await downloadAllSpaceContent(fetchPage, { pageSize: 100 });

  t.deepEqual(space.settings, { name: 'my space', id: 'space-1' });
});

test('reports progress per page', async t => {
  const { fetchPage } = fakeApi({ page: 250 });
  const pages: number[] = [];
  await downloadAllSpaceContent(fetchPage, {
    pageSize: 100,
    onPage: ({ total }) => pages.push(total),
  });

  t.deepEqual(pages, [100, 200, 250]);
});

test('duplicate entries across pages are not written twice', async t => {
  let call = 0;
  const fetchPage: FetchSpacePage = async () => {
    call++;
    return {
      settings: {},
      meta: {},
      models: [
        {
          name: 'page',
          everything: {},
          // a server that ignores offset would loop forever without dedupe
          content: call > 3 ? [] : makeEntries('page', 0, 2),
        },
      ],
    } as SpacePage;
  };

  const space = await downloadAllSpaceContent(fetchPage, { pageSize: 2 });

  t.is(space.models[0].content.length, 2);
  t.is(call, 2);
});

test('entries without ids are still collected', async t => {
  const fetchPage: FetchSpacePage = async ({ offset }) => ({
    settings: {},
    meta: {},
    models: [
      {
        name: 'page',
        everything: {},
        content: offset === 0 ? [{ name: 'a' }, { name: 'b' }] : [{ name: 'c' }],
      },
    ],
  });

  const space = await downloadAllSpaceContent(fetchPage, { pageSize: 2 });

  t.is(space.models[0].content.length, 3);
});

test('two distinct models sharing a name are kept separate, not merged', async t => {
  const fetchPage: FetchSpacePage = async () => ({
    settings: {},
    meta: {},
    models: [
      { id: 'model-1', name: 'Posts', content: [{ id: 'a', name: 'A' }] },
      { id: 'model-2', name: 'Posts', content: [{ id: 'b', name: 'B' }] },
    ],
  });

  const result = await downloadAllSpaceContent(fetchPage, { pageSize: 100 });

  t.is(result.models.length, 2);
  t.deepEqual(
    result.models.map(m => m.id).sort(),
    ['model-1', 'model-2']
  );
  t.deepEqual(
    result.models
      .reduce<string[]>((ids, model) => ids.concat(model.content.map(entry => entry.id as string)), [])
      .sort(),
    ['a', 'b']
  );
});

test('an empty space produces no content', async t => {
  const { fetchPage, calls } = fakeApi({ page: 0 });
  const space = await downloadAllSpaceContent(fetchPage, { pageSize: 100 });

  t.is(calls.length, 1);
  t.is(space.models[0].content.length, 0);
});

test('a server ignoring offset with id-less entries still terminates', async t => {
  let calls = 0;
  const fetchPage: FetchSpacePage = async () => {
    calls++;
    return {
      settings: {},
      meta: {},
      models: [
        {
          name: 'page',
          everything: {},
          // identical id-less entries every time, as if offset were ignored
          content: [{ name: 'a' }, { name: 'b' }],
        },
      ],
    } as SpacePage;
  };

  const space = await downloadAllSpaceContent(fetchPage, { pageSize: 2 });

  // the first page is new, the second page is recognized as a repeat of the
  // same content (added === 0) and terminates the loop instead of looping
  // forever the way an offset-based dedupe key would
  t.is(calls, 2);
  t.is(space.models[0].content.length, 2);
});

test('distinct id-less entries across pages are all collected', async t => {
  const fetchPage: FetchSpacePage = async ({ offset }) => ({
    settings: {},
    meta: {},
    models: [
      {
        name: 'page',
        everything: {},
        content:
          offset === 0
            ? [{ name: 'first' }, { name: 'second' }]
            : offset === 2
              ? [{ name: 'third' }, { name: 'fourth' }]
              : [],
      },
    ],
  });

  const space = await downloadAllSpaceContent(fetchPage, { pageSize: 2 });

  t.deepEqual(
    space.models[0].content.map(entry => entry.name),
    ['first', 'second', 'third', 'fourth']
  );
});

test('throws once maxPages is exceeded instead of looping forever', async t => {
  let calls = 0;
  const fetchPage: FetchSpacePage = async () => {
    calls++;
    return {
      settings: {},
      meta: {},
      // unique content every call so dedupe never kicks in, simulating a
      // space that keeps growing faster than it can be paged through
      models: [{ name: 'page', everything: {}, content: [{ name: `entry-${calls}` }] }],
    } as SpacePage;
  };

  const error = await t.throwsAsync(
    downloadAllSpaceContent(fetchPage, { pageSize: 1, maxPages: 5 })
  );

  t.is(calls, 5);
  t.true(error.message.includes('5 pages'));
});
