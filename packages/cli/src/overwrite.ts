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
  method: 'PUT' | 'POST' | 'DELETE';
  url: string;
}

/**
 * PUT upserts by id: it updates the entry if it already exists in the target
 * space and creates it (with that id) otherwise, which is what makes
 * `overwrite` idempotent and safe to re-run. Entries without an id (rare,
 * see pagination.ts) can't be targeted by id, so they fall back to POST and
 * are always created fresh.
 */
export const buildWriteRequest = (
  modelName: string,
  entry: { id?: string | null }
): WriteRequest => {
  if (entry.id) {
    return { method: 'PUT', url: `${WRITE_API_ROOT}/${modelName}/${entry.id}` };
  }
  return { method: 'POST', url: `${WRITE_API_ROOT}/${modelName}` };
};

export const buildDeleteRequest = (modelName: string, entryId: string): WriteRequest => ({
  method: 'DELETE',
  url: `${WRITE_API_ROOT}/${modelName}/${entryId}`,
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
