import { createHash } from 'crypto';

/**
 * The Content API caps non-collection queries at 100 entries per request, so a
 * full space snapshot has to be assembled from multiple offset pages.
 */
export const MAX_CONTENT_PAGE_SIZE = 100;

/**
 * Defense in depth against a server that never stops returning full pages
 * (e.g. it ignores `offset`, or content is being added faster than we can
 * page through it). ~10M entries at the max page size — no real space
 * should ever hit this, so tripping it means something is wrong upstream.
 */
export const MAX_PAGES = 100_000;

export interface ContentEntry {
  id?: string | null;
  name?: string | null;
  [key: string]: any;
}

export interface ModelPage {
  id?: string | null;
  name: string;
  content?: ContentEntry[] | null;
  [key: string]: any;
}

export interface SpacePage {
  settings: any;
  meta: any;
  models: ModelPage[];
}

export interface SpaceSnapshot extends SpacePage {
  models: Array<ModelPage & { content: ContentEntry[] }>;
}

export type FetchSpacePage = (query: { limit: number; offset: number }) => Promise<SpacePage>;

export interface PageProgress {
  page: number;
  offset: number;
  limit: number;
  added: number;
  total: number;
}

export interface DownloadAllOptions {
  pageSize?: number;
  onPage?: (progress: PageProgress) => void;
  maxPages?: number;
}

export const clampPageSize = (pageSize?: number | null) => {
  if (typeof pageSize !== 'number' || !isFinite(pageSize) || pageSize < 1) {
    return MAX_CONTENT_PAGE_SIZE;
  }
  return Math.min(Math.floor(pageSize), MAX_CONTENT_PAGE_SIZE);
};

const isPlainObject = (value: any): value is Record<string, any> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

/**
 * `meta` carries the clone id maps that `create` uses to remap ids. The API
 * builds them from the entries in the current page, so every page contributes
 * mappings that the others are missing.
 */
const mergeMeta = (base: any, next: any): any => {
  if (!isPlainObject(base)) {
    return isPlainObject(next) ? { ...next } : base;
  }
  if (!isPlainObject(next)) {
    return base;
  }
  const merged: Record<string, any> = { ...base };
  Object.keys(next).forEach(key => {
    const baseValue = merged[key];
    const nextValue = next[key];
    merged[key] =
      isPlainObject(baseValue) && isPlainObject(nextValue)
        ? mergeMeta(baseValue, nextValue)
        : nextValue;
  });
  return merged;
};

/**
 * Entries with an id are deduped by that id. Entries without one (rare) are
 * deduped by a content fingerprint instead of their position in the page:
 * a position-based key changes every iteration even if the server ignores
 * `offset` and keeps re-sending the same entries, which would defeat the
 * `added === 0` termination check below and page forever. Two distinct
 * id-less entries with identical content will collide and be treated as
 * one, which is an acceptable trade-off against an infinite loop.
 */
const entryKey = (entry: ContentEntry, modelName: string) => {
  if (typeof entry?.id === 'string' && entry.id) {
    return entry.id;
  }
  const fingerprint = createHash('sha1')
    .update(JSON.stringify(entry))
    .digest('hex');
  return `${modelName}:__no-id__:${fingerprint}`;
};

/**
 * Walks every offset page until each model is exhausted and returns a single
 * space snapshot shaped exactly like one `downloadClone` response.
 */
export const downloadAllSpaceContent = async (
  fetchPage: FetchSpacePage,
  options: DownloadAllOptions = {}
): Promise<SpaceSnapshot> => {
  const limit = clampPageSize(options.pageSize);
  const maxPages = options.maxPages ?? MAX_PAGES;

  let snapshot: SpaceSnapshot | undefined;
  let offset = 0;
  let page = 0;

  // `downloadClone` mints a fresh `id` on every call (see the `import`
  // command's docs: it produces a clone with new IDs), so the same model
  // gets a different id on each paginated request -- grouping by id would
  // treat one real model as a new one on every page. Name is what's
  // actually stable across pages, so it's the only safe grouping key here.
  const modelGroupKey = (model: ModelPage) => model.name;
  const modelsByKey = new Map<string, ModelPage & { content: ContentEntry[] }>();
  const seenEntryKeys = new Map<string, Set<string>>();

  while (true) {
    const result = await fetchPage({ limit, offset });
    page++;

    const pageModels = result?.models || [];

    if (!snapshot) {
      snapshot = { ...result, models: [] };
    } else {
      snapshot.settings = snapshot.settings ?? result?.settings;
      snapshot.meta = mergeMeta(snapshot.meta, result?.meta);
    }

    let added = 0;
    let hasFullPage = false;

    pageModels.forEach(model => {
      const content = model?.content || [];
      if (content.length >= limit) {
        hasFullPage = true;
      }

      const key = modelGroupKey(model);
      let target = modelsByKey.get(key);
      if (!target) {
        target = { ...model, content: [] };
        modelsByKey.set(key, target);
        seenEntryKeys.set(key, new Set());
        snapshot!.models.push(target);
      }

      const seen = seenEntryKeys.get(key)!;
      content.forEach(entry => {
        const entryDedupeKey = entryKey(entry, key);
        if (seen.has(entryDedupeKey)) {
          return;
        }
        seen.add(entryDedupeKey);
        target!.content.push(entry);
        added++;
      });
    });

    const total = snapshot.models.reduce((sum, model) => sum + model.content.length, 0);
    options.onPage?.({ page, offset, limit, added, total });

    // `added === 0` also guards against a server that ignores `offset` and
    // would otherwise keep handing back the same full page forever.
    if (!hasFullPage || added === 0) {
      break;
    }

    if (page >= maxPages) {
      throw new Error(
        `Stopped after ${maxPages} pages without reaching the end of the content — this space may be growing faster than it can be paged through, or the API is not honoring \`offset\` as expected.`
      );
    }

    offset += limit;
  }

  return snapshot!;
};
