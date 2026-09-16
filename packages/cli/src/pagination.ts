/**
 * The Content API caps non-collection queries at 100 entries per request, so a
 * full space snapshot has to be assembled from multiple offset pages.
 */
export const MAX_CONTENT_PAGE_SIZE = 100;

export interface ContentEntry {
  id?: string | null;
  name?: string | null;
  [key: string]: any;
}

export interface ModelPage {
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

const entryKey = (entry: ContentEntry, modelName: string, position: number) =>
  typeof entry?.id === 'string' && entry.id ? entry.id : `${modelName}:__no-id__:${position}`;

/**
 * Walks every offset page until each model is exhausted and returns a single
 * space snapshot shaped exactly like one `downloadClone` response.
 */
export const downloadAllSpaceContent = async (
  fetchPage: FetchSpacePage,
  options: DownloadAllOptions = {}
): Promise<SpaceSnapshot> => {
  const limit = clampPageSize(options.pageSize);

  let snapshot: SpaceSnapshot | undefined;
  let offset = 0;
  let page = 0;

  const modelsByName = new Map<string, ModelPage & { content: ContentEntry[] }>();
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

      let target = modelsByName.get(model.name);
      if (!target) {
        target = { ...model, content: [] };
        modelsByName.set(model.name, target);
        seenEntryKeys.set(model.name, new Set());
        snapshot!.models.push(target);
      }

      const seen = seenEntryKeys.get(model.name)!;
      content.forEach((entry, index) => {
        const key = entryKey(entry, model.name, offset + index);
        if (seen.has(key)) {
          return;
        }
        seen.add(key);
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

    offset += limit;
  }

  return snapshot!;
};
