import { kebabCase } from 'lodash';

export const WRITE_API_ROOT = 'https://builder.io/api/v1/write';

export interface ExistingModel {
  id: string;
  name: string;
}

export type ModelSyncPlan = { action: 'update'; existingId: string } | { action: 'create' };

/**
 * Model directories on disk are kebab-cased (see `kebabCase(model.name)` in
 * `importSpace`), so matching back to the destination space's models has to
 * kebab-case their names too, otherwise every model looks new.
 */
export const planModelSync = (
  existingModels: ExistingModel[],
  modelDirName: string
): ModelSyncPlan => {
  const match = existingModels.find(model => kebabCase(model.name) === modelDirName);
  return match ? { action: 'update', existingId: match.id } : { action: 'create' };
};

export interface WriteRequest {
  method: 'PUT' | 'POST' | 'PATCH' | 'DELETE';
  url: string;
}

/**
 * PUT-by-id is used whenever an entry has an id, updating it if it already
 * exists in the target space. Whether it also creates the entry when it
 * doesn't exist yet is unconfirmed -- the caller falls back to POST on a 404
 * to cover that case either way. Entries without an id (rare, see
 * pagination.ts) can't be targeted by id, so they fall back to POST directly
 * and are always created fresh.
 */
export const buildWriteRequest = (
  modelName: string,
  entry: { id?: string | null }
): WriteRequest => {
  if (entry.id) {
    return {
      method: 'PUT',
      url: `${WRITE_API_ROOT}/${encodeURIComponent(modelName)}/${encodeURIComponent(entry.id)}`,
    };
  }
  return { method: 'POST', url: `${WRITE_API_ROOT}/${encodeURIComponent(modelName)}` };
};

export const buildDeleteRequest = (modelName: string, entryId: string): WriteRequest => ({
  method: 'DELETE',
  url: `${WRITE_API_ROOT}/${encodeURIComponent(modelName)}/${encodeURIComponent(entryId)}`,
});

/**
 * A plain POST/PUT-by-id write doesn't reliably preserve an entry's
 * `priority` -- confirmed against a real space, where entries created via
 * POST ended up with server-assigned priorities unrelated to the ones sent
 * in the request body. A follow-up PATCH targeting the now-known id, whose
 * body contains nothing but `priority`, is a targeted update to a doc that
 * already exists rather than a value supplied at creation time, and is the
 * only way confirmed to make the target space's order actually match the
 * snapshot's.
 */
export const buildPriorityPatchRequest = (modelName: string, entryId: string): WriteRequest => ({
  method: 'PATCH',
  url: `${WRITE_API_ROOT}/${encodeURIComponent(modelName)}/${encodeURIComponent(entryId)}`,
});


/**
 * `--prune` makes `overwrite` a true mirror: entries that exist in the
 * target space for a model being restored, but aren't in the local
 * snapshot, get deleted. Only entries with an id can be targeted for
 * deletion.
 */
export const findStaleEntryIds = (
  existingEntries: Array<{ id?: string | null }>,
  keepIds: ReadonlySet<string>
): string[] =>
  existingEntries
    .map(entry => entry.id)
    .filter((id): id is string => !!id && !keepIds.has(id));
