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
  [key: string]: unknown;
}

export interface ModelPage {
  id?: string | null;
  name: string;
  content?: ContentEntry[] | null;
  everything?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SpacePage {
  settings: Record<string, unknown>;
  meta?: Record<string, unknown>;
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

export interface DownloadAllSpaceOptions extends DownloadAllOptions {
  /**
   * When provided, newly-seen entries are handed off page-by-page instead
   * of being accumulated into the returned snapshot's `model.content`
   * arrays (which are left empty) -- this lets a caller write each page to
   * disk as it arrives rather than holding a full space's worth of content
   * bodies in memory until every page has been fetched. `page` is the
   * 1-indexed page this batch came from, so a caller that needs to defer
   * work until every model is known (which happens on page 1, since every
   * model is included on every page regardless of its own content
   * pagination progress) can tell page 1 apart from the rest.
   */
  onEntries?: (model: ModelPage, entries: ContentEntry[], page: number) => void | Promise<void>;
}

export const clampPageSize = (pageSize?: number | null) => {
  if (typeof pageSize !== 'number' || !isFinite(pageSize) || pageSize < 1) {
    return MAX_CONTENT_PAGE_SIZE;
  }
  return Math.min(Math.floor(pageSize), MAX_CONTENT_PAGE_SIZE);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

/**
 * `meta` carries the clone id maps that `create` uses to remap ids. The API
 * builds them from the entries in the current page, so every page contributes
 * mappings that the others are missing.
 */
const mergeMeta = (
  base: Record<string, unknown> | undefined,
  next: Record<string, unknown> | undefined
): Record<string, unknown> | undefined => {
  if (!isPlainObject(base)) {
    return isPlainObject(next) ? { ...next } : base;
  }
  if (!isPlainObject(next)) {
    return base;
  }
  const merged: Record<string, unknown> = { ...base };
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

const stableEntryId = (entry: ContentEntry): string | undefined =>
  typeof entry?.id === 'string' && entry.id ? entry.id : undefined;

/**
 * Content fingerprint for an id-less entry (rare). Used only to detect a
 * server that ignores `offset` and re-sends the same page forever -- a
 * position-based key would change every iteration even when the content is
 * identical, which would defeat the `added === 0` termination check below.
 */
const contentFingerprint = (entry: ContentEntry) =>
  createHash('sha1').update(JSON.stringify(entry)).digest('hex');

const fingerprintsMatch = (a: string[], b: string[]) =>
  a.length > 0 && a.length === b.length && a.every((fingerprint, i) => fingerprint === b[i]);

export type FetchModelContentPage = (query: {
  limit: number;
  offset: number;
}) => Promise<{ content?: ContentEntry[] | null } | null | undefined>;

/**
 * Paginates a single model's content in isolation, rather than as part of
 * one shared multi-model query. Used for the v3 content REST endpoint,
 * which (unlike the admin GraphQL API's batched `models { content }`
 * field) has to be called once per model -- a bonus of that is that a
 * failure fetching one model's content never affects any other model's,
 * since each is a fully independent request.
 */
export const downloadAllModelContent = async (
  fetchPage: FetchModelContentPage,
  modelName: string,
  options: DownloadAllOptions = {}
): Promise<ContentEntry[]> => {
  const limit = clampPageSize(options.pageSize);
  const maxPages = options.maxPages ?? MAX_PAGES;

  const seenIds = new Set<string>();
  let previousNoIdFingerprints: string[] = [];
  const content: ContentEntry[] = [];
  let offset = 0;
  let page = 0;

  while (true) {
    const result = await fetchPage({ limit, offset });
    page++;

    const pageEntries = result?.content || [];
    const hasFullPage = pageEntries.length >= limit;

    const noIdFingerprints = pageEntries
      .filter(entry => stableEntryId(entry) === undefined)
      .map(contentFingerprint);
    // id-less entries are only deduped when this whole page's id-less
    // content exactly repeats the previous page's -- the signal that the
    // server is ignoring `offset` -- rather than by content fingerprint
    // alone, which would otherwise collapse two distinct id-less entries
    // that happen to share identical content (see stableEntryId)
    const isRepeatedPage = fingerprintsMatch(noIdFingerprints, previousNoIdFingerprints);
    previousNoIdFingerprints = noIdFingerprints;

    let added = 0;
    pageEntries.forEach(entry => {
      const id = stableEntryId(entry);
      if (id !== undefined) {
        if (seenIds.has(id)) {
          return;
        }
        seenIds.add(id);
      } else if (isRepeatedPage) {
        return;
      }
      content.push(entry);
      added++;
    });

    options.onPage?.({ page, offset, limit, added, total: content.length });

    if (!hasFullPage || added === 0) {
      break;
    }

    if (page >= maxPages) {
      throw new Error(
        `Stopped after ${maxPages} pages without reaching the end of "${modelName}"'s content — this model may be growing faster than it can be paged through, or the API is not honoring \`offset\` as expected.`
      );
    }

    offset += limit;
  }

  return content;
};

/**
 * Walks every offset page until each model is exhausted and returns a single
 * space snapshot shaped exactly like one `downloadClone` response.
 *
 * Passing `onEntries` streams each page's newly-seen entries out to the
 * caller instead of accumulating them in the returned snapshot -- otherwise
 * a full space download holds every content body in memory at once until
 * pagination finishes, which can be a lot for a large space. When
 * `onEntries` is used, every `model.content` in the returned snapshot is
 * left empty; the model list, `settings`, and `meta` are still populated
 * normally.
 */
export const downloadAllSpaceContent = async (
  fetchPage: FetchSpacePage,
  options: DownloadAllSpaceOptions = {}
): Promise<SpaceSnapshot> => {
  const limit = clampPageSize(options.pageSize);
  const maxPages = options.maxPages ?? MAX_PAGES;

  let snapshot: SpaceSnapshot | undefined;
  let offset = 0;
  let page = 0;
  let totalEntries = 0;

  // `downloadClone` mints a fresh `id` on every call (see the `import`
  // command's docs: it produces a clone with new IDs), so the same model
  // gets a different id on each paginated request -- grouping by id would
  // treat one real model as a new one on every page. Name is what's
  // actually stable across pages, so it's the only safe grouping key here.
  const modelGroupKey = (model: ModelPage) => model.name;
  const modelsByKey = new Map<string, ModelPage & { content: ContentEntry[] }>();
  const seenIdsByKey = new Map<string, Set<string>>();
  const previousNoIdFingerprintsByKey = new Map<string, string[]>();

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

    for (const model of pageModels) {
      const content = model?.content || [];
      if (content.length >= limit) {
        hasFullPage = true;
      }

      const key = modelGroupKey(model);
      let target = modelsByKey.get(key);
      let isNewModel = false;
      if (!target) {
        target = { ...model, content: [] };
        modelsByKey.set(key, target);
        seenIdsByKey.set(key, new Set());
        previousNoIdFingerprintsByKey.set(key, []);
        snapshot!.models.push(target);
        isNewModel = true;
      }

      const seenIds = seenIdsByKey.get(key)!;
      const noIdFingerprints = content
        .filter(entry => stableEntryId(entry) === undefined)
        .map(contentFingerprint);
      // id-less entries are only deduped when this whole page's id-less
      // content exactly repeats the previous page's for this model -- the
      // signal that the server is ignoring `offset` -- rather than by
      // content fingerprint alone, which would otherwise collapse two
      // distinct id-less entries that happen to share identical content
      const isRepeatedPage = fingerprintsMatch(
        noIdFingerprints,
        previousNoIdFingerprintsByKey.get(key)!
      );
      previousNoIdFingerprintsByKey.set(key, noIdFingerprints);

      const newEntries: ContentEntry[] = [];
      content.forEach(entry => {
        const id = stableEntryId(entry);
        if (id !== undefined) {
          if (seenIds.has(id)) {
            return;
          }
          seenIds.add(id);
        } else if (isRepeatedPage) {
          return;
        }
        newEntries.push(entry);
      });

      if (newEntries.length > 0) {
        if (options.onEntries) {
          // the caller is streaming entries to disk itself -- keeping them
          // in `target.content` too would defeat the point of streaming by
          // buffering a full space's worth of content bodies in memory
          await options.onEntries(target, newEntries, page);
        } else {
          target.content.push(...newEntries);
        }
        added += newEntries.length;
        totalEntries += newEntries.length;
      } else if (isNewModel && options.onEntries) {
        // a model with no content at all would otherwise never be handed to
        // the caller, since it never has any new entries to stream -- notify
        // once, on first sight, so a model with zero entries still gets
        // staged (e.g. its schema written) instead of silently disappearing
        // from a streamed snapshot
        await options.onEntries(target, [], page);
      }
    }

    options.onPage?.({ page, offset, limit, added, total: totalEntries });

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
