import { createClient } from './autogen/client/createClient';
import path from 'path';
import fse from 'fs-extra';
import { kebabCase, omit } from 'lodash';
import chalk from 'chalk';
import { readAsJson, getFiles, getDirectories, replaceField, confirmAction, isHidden } from './utils';
import cliProgress from 'cli-progress';
import { createHash } from 'crypto';
import traverse from 'traverse';
import {
  ContentEntry,
  downloadAllModelContent,
  downloadAllSpaceContent,
  FetchModelContentPage,
  FetchSpacePage,
  MAX_CONTENT_PAGE_SIZE,
  ModelPage,
  SpacePage,
  SpaceSnapshot,
} from './pagination';
import {
  DEFAULT_WRITE_CONCURRENCY,
  DEFAULT_WRITE_RETRIES,
  FetchLike,
  isHttpErrorWithStatus,
  mapWithConcurrency,
  postJsonWithRetry,
  retryAsync,
} from './write-queue';
import {
  buildDeleteRequest,
  buildPriorityPatchRequest,
  buildWriteRequest,
  ExistingModel,
  findStaleEntryIds,
  planModelSync,
  WRITE_API_ROOT,
} from './overwrite';

const MULTIBAR = new cliProgress.MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
    format: '|{bar}| {name} | {value}/{total}',
    // without this `create()` returns undefined when stdout is not a TTY,
    // which crashes the CLI when it runs piped or from CI
    noTTYOutput: true,
  },
  cliProgress.Presets.shades_grey
);

const root = 'https://cdn.builder.io';

// Builds a path next to `dir` (e.g. for a staging/backup copy) that's a true
// sibling regardless of how `dir` was written -- a trailing slash (`./backup/`),
// `.`, or any other input that isn't already a clean absolute path would
// otherwise make plain string concatenation (`dir + suffix`) land *inside*
// `dir` instead of next to it, since fs-extra's own directory-nesting check
// operates on resolved path segments and a raw suffix can accidentally
// satisfy "is a subdirectory of" for exactly these inputs.
const siblingPath = (dir: string, suffix: string) => {
  const resolved = path.resolve(dir);
  return path.join(path.dirname(resolved), path.basename(resolved) + suffix);
};

/**
 * A model directory in a real snapshot only ever contains JSON files named
 * exactly the way importSpace's writer names them: one `schema.model.json`
 * plus `entry-id-*.json` / `entry-noid-<n>.json` content files -- checking
 * for `schema.model.json`'s filename alone would let an unrelated directory
 * that merely happens to contain a file with that name (e.g. from an
 * unrelated tool or project template) pass as a snapshot too, and checking
 * only that every filename ends in `.json` would still let an unrelated
 * `config.json` or similar sit alongside a coincidental schema.model.json.
 * Hidden files (.DS_Store, .gitkeep, ...) are ignored, matching the
 * getFiles/getDirectories readers used elsewhere, which already skip them.
 * Parsing is only done for schema.model.json itself -- doing that for every
 * content file too would make this guard re-read and re-parse an entire
 * large snapshot's worth of entries on every single re-run, just to prove
 * something importSpace already wrote correctly the first time.
 */
const CONTENT_FILENAME_PATTERN = /^entry-(id-.+|noid-\d+)\.json$/;

const looksLikeSnapshotModelDir = async (dir: string): Promise<boolean> => {
  const entries = (await fse.readdir(dir, { withFileTypes: true })).filter(
    entry => !isHidden(entry.name)
  );
  const isExpectedFile = (entry: fse.Dirent) =>
    entry.isFile() &&
    (entry.name === 'schema.model.json' || CONTENT_FILENAME_PATTERN.test(entry.name));
  if (!entries.every(isExpectedFile)) {
    return false;
  }
  try {
    const schema = await readAsJsonQuietly(path.join(dir, 'schema.model.json'));
    return isPlainObject(schema) && typeof schema.name === 'string';
  } catch {
    return false;
  }
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

// avoid readAsJson here: it logs "error parsing ..." on bad/missing JSON,
// which would spam the console for every directory this probe correctly rejects
const readAsJsonQuietly = async (filePath: string) =>
  JSON.parse((await fse.readFile(filePath)).toString());

// a bare filename match would let an unrelated settings.json (e.g. from an
// editor or another tool) pass as a snapshot's settings file -- every real
// one importSpace writes carries the space's own name, so require that
// much before trusting it enough to let the directory be destructively
// replaced.
const looksLikeSnapshotSettings = async (filePath: string): Promise<boolean> => {
  try {
    const settings = await readAsJsonQuietly(filePath);
    return isPlainObject(settings) && typeof settings.name === 'string';
  } catch {
    return false;
  }
};

/**
 * A successful import fully replaces `directory`'s previous contents (see
 * `swapInStagingDir`), which is only safe if that directory is empty, new,
 * or already holds nothing but a prior snapshot from this same command.
 * Without this check, something like `-o .` or `-o ~` would silently
 * delete every unrelated file already in that directory.
 */
const isSafeToReplace = async (directory: string): Promise<boolean> => {
  const resolved = path.resolve(directory);
  if (!(await fse.pathExists(resolved))) {
    return true;
  }
  const entries = await fse.readdir(resolved, { withFileTypes: true });
  for (const entry of entries) {
    // a snapshot directory that's version-controlled (.git) or just been
    // browsed on macOS (.DS_Store) picks these up too -- getFiles/
    // getDirectories already ignore them elsewhere, so this guard should
    // not be stricter than the readers that actually walk the snapshot
    if (isHidden(entry.name)) {
      continue;
    }
    if (
      entry.isFile() &&
      entry.name === 'settings.json' &&
      (await looksLikeSnapshotSettings(path.join(resolved, entry.name)))
    ) {
      continue;
    }
    if (entry.isDirectory() && (await looksLikeSnapshotModelDir(path.join(resolved, entry.name)))) {
      continue;
    }
    return false;
  }
  return true;
};

const IMPORTING_PREFIX = '.importing-';
const PREVIOUS_PREFIX = '.previous-';

/**
 * A crash between the two renames inside `swapInStagingDir` (or one that
 * interrupts a run before it gets that far) can leave a `.previous-*` sibling
 * next to `directory`. If that crash happened between moving the main
 * directory aside and moving the staging directory into place, the
 * `.previous-*` sibling is the last known-good snapshot and should be
 * restored: without this, a crash in that narrow window (which can be
 * minutes wide on a network-mounted output path, where moves fall back to
 * copy+delete) would otherwise make a snapshot that was already safely on
 * disk appear to have vanished. Otherwise `.previous-*` is just debris
 * from a successful run whose final cleanup step didn't finish, so it can
 * be discarded.
 *
 * `.importing-*` directories are left as-is rather than cleaned up here,
 * since we cannot safely determine whether they belong to a crashed run
 * (safe to remove) or an active concurrent import (must not touch).
 * Concurrent imports to the same directory are not supported, but accidental
 * disk clutter is preferable to silently breaking an in-flight import.
 */
const recoverStaleSiblings = async (directory: string) => {
  const resolved = path.resolve(directory);
  const parent = path.dirname(resolved);
  const base = path.basename(resolved);
  if (!(await fse.pathExists(parent))) {
    return;
  }
  const entries = await fse.readdir(parent, { withFileTypes: true });
  const directoryExists = await fse.pathExists(resolved);
  const previousCandidates = entries
    .filter(entry => entry.isDirectory() && entry.name.startsWith(`${base}${PREVIOUS_PREFIX}`))
    .map(entry => path.join(parent, entry.name))
    .sort()
    .reverse();

  if (previousCandidates.length === 0) {
    return;
  }

  if (!directoryExists) {
    const [mostRecent, ...stale] = previousCandidates;
    console.log(
      chalk.yellow(
        `\nFound "${mostRecent}" left over from a previous import that appears to have been interrupted while replacing "${resolved}", which is now missing -- restoring it from that backup before continuing.`
      )
    );
    await fse.move(mostRecent, resolved, { overwrite: true }).catch(() => {});
    await Promise.all(stale.map(dir => fse.remove(dir).catch(() => {})));
  } else {
    await Promise.all(previousCandidates.map(dir => fse.remove(dir).catch(() => {})));
  }
};

const createGraphqlClient = (privateKey: string) =>
  createClient({
    fetcher: async ({ query, variables }) => {
      // queries are pure reads, so they're always safe to retry on a
      // transient failure -- a large space's snapshot or prune scan can
      // take hundreds of paginated requests, and without this a single
      // blip partway through would otherwise fail the entire run with no
      // way to resume short of starting over. Mutations get the same
      // stall protection (a hung connection would otherwise block forever)
      // but no automatic retry, since e.g. addModel/createSpace create
      // something new on every call and aren't safe to retry blindly.
      const isMutation = query.trimStart().startsWith('mutation');
      const response = await postJsonWithRetry({
        fetchImpl: (fetch as unknown) as FetchLike,
        url: `${root}/api/v2/admin`,
        method: 'POST',
        body: { query, variables },
        headers: { Authorization: `Bearer ${privateKey}` },
        retries: isMutation ? 0 : DEFAULT_WRITE_RETRIES,
      });
      return JSON.parse(await response.text());
    },
  });

const REST_CONTENT_ROOT = 'https://cdn.builder.io/api/v3/content';

// see the comment where this is used (in `importSpace`) for why drafts are
// fetched per-model through this REST endpoint rather than through the
// admin GraphQL API's batched `models { content }` field
// confirmed against a real space: the v3 content REST endpoint's default
// field set silently omits `priority` -- and `fields` is a projection that
// replaces that default set rather than extending it, so there's no single
// request that returns both the full raw entry and `priority` together. A
// second, narrow request for just `id`/`priority` (same query/sort/
// pagination as the caller's main request) gets merged back in by id
// instead. Shared by both the REST (draft-inclusive) and GraphQL
// (published-only) import paths below, since the GraphQL admin API's
// `content` field turns out to omit `priority` the same way.
const fetchPriorityById = async (
  privateKey: string,
  modelName: string,
  params: URLSearchParams
): Promise<Map<string, number>> => {
  const priorityParams = new URLSearchParams(params);
  priorityParams.set('fields', 'id,priority');
  const response = await postJsonWithRetry({
    fetchImpl: (fetch as unknown) as FetchLike,
    method: 'GET',
    url: `${REST_CONTENT_ROOT}/${encodeURIComponent(modelName)}?${priorityParams.toString()}`,
    headers: { Authorization: `Bearer ${privateKey}` },
  });
  const body = JSON.parse(await response.text());
  const priorityById = new Map<string, number>();
  ((body?.results || []) as ContentEntry[]).forEach(entry => {
    if (typeof entry.id === 'string' && typeof entry.priority === 'number') {
      priorityById.set(entry.id, entry.priority);
    }
  });
  return priorityById;
};

const mergePriorityById = (
  results: ContentEntry[],
  priorityById: Map<string, number>
): void => {
  results.forEach(entry => {
    if (typeof entry.id === 'string' && priorityById.has(entry.id)) {
      entry.priority = priorityById.get(entry.id);
    }
  });
};

const fetchModelContentPageRest = (
  privateKey: string,
  apiKey: string,
  modelName: string,
  createdAtOrBefore: number,
  includeUnpublished: boolean
): FetchModelContentPage => async ({ limit, offset }) => {
  const params = new URLSearchParams({
    apiKey,
    limit: String(limit),
    offset: String(offset),
    includeRefs: 'false',
    'query.createdDate.$lte': String(createdAtOrBefore),
    'sort.createdDate': '1',
    'sort.id': '1',
  });
  if (includeUnpublished) {
    params.set('includeUnpublished', 'true');
  }
  const response = await postJsonWithRetry({
    fetchImpl: (fetch as unknown) as FetchLike,
    method: 'GET',
    url: `${REST_CONTENT_ROOT}/${encodeURIComponent(modelName)}?${params.toString()}`,
    headers: { Authorization: `Bearer ${privateKey}` },
  });
  const body = JSON.parse(await response.text());
  const results: ContentEntry[] = body?.results || [];

  if (results.length > 0) {
    mergePriorityById(results, await fetchPriorityById(privateKey, modelName, params));
  }

  return { content: results };
};

/**
 * Entries carry their own `priority` field (a float, so new entries can be
 * inserted between two existing ones without renumbering the rest) which is
 * exactly what Builder's default sort/delivery order is based on -- lower
 * values sort first. It's undocumented in the public write API reference,
 * but since `create`/`overwrite` already forward each entry's full JSON
 * body (rather than a hand-picked subset of fields) on POST, `priority` is
 * already included in every write; sorting local write order by it too
 * means the order entries are created in matches the order they'll render
 * in even if the API only uses insertion order for entries missing an
 * explicit priority. `createdDate` is the fallback for the rare entry
 * missing a `priority`. A single shared concurrency pool across every task
 * (as `mapWithConcurrency` alone would do) can't guarantee relative order,
 * since whichever request happens to land first determines the new order
 * -- so tasks are grouped by model first, and only different models'
 * groups run concurrently; within one model, tasks are awaited strictly in
 * the order the caller already sorted them.
 */
const entryOrderKey = (entry: Record<string, unknown> | null | undefined) => {
  if (typeof entry?.priority === 'number') {
    return entry.priority;
  }
  return typeof entry?.createdDate === 'number' ? entry.createdDate : Infinity;
};
const writeSequentiallyPerModel = async <T extends { modelName: string }>(
  tasks: T[],
  write: (task: T) => Promise<void>
): Promise<void> => {
  const tasksByModel = new Map<string, T[]>();
  tasks.forEach(task => {
    tasksByModel.set(task.modelName, [...(tasksByModel.get(task.modelName) || []), task]);
  });
  await mapWithConcurrency(
    Array.from(tasksByModel.values()),
    DEFAULT_WRITE_CONCURRENCY,
    async tasksForModel => {
      for (const task of tasksForModel) {
        await write(task);
      }
    }
  );
};

/**
 * Confirmed against a real space: a plain create/update write doesn't
 * reliably store the `priority` value sent in its body -- entries created
 * via POST ended up with server-assigned priorities unrelated to the ones
 * in the request. This runs after every entry already has a real id in the
 * target space, PATCHing `priority` on its own as a targeted update to an
 * existing doc, which is what actually sticks. Each PATCH targets a
 * different entry, so unlike the writes above there's no ordering
 * requirement between them and they can all run at full concurrency.
 * Entries with no explicit `priority` in the snapshot are left alone --
 * for those, the closest available approximation is still the creation
 * order `writeSequentiallyPerModel` already produces.
 */
const applyPriorityPatches = async (
  tasks: Array<{ modelName: string; id: string; priority: number }>,
  authKey: string,
  onProgress: () => void,
  onFailure: (task: { modelName: string; id: string }, error: unknown) => void
): Promise<void> => {
  await mapWithConcurrency(tasks, DEFAULT_WRITE_CONCURRENCY, async task => {
    const patchRequest = buildPriorityPatchRequest(task.modelName, task.id);
    try {
      await postJsonWithRetry({
        fetchImpl: (fetch as unknown) as FetchLike,
        method: patchRequest.method,
        url: patchRequest.url,
        body: { priority: task.priority },
        headers: { Authorization: `Bearer ${authKey}` },
        retries: DEFAULT_WRITE_RETRIES,
      });
    } catch (e) {
      onFailure(task, e);
    }
    onProgress();
  });
};

export const importSpace = async (
  privateKey: string,
  directory: string,
  debug = false,
  limit = MAX_CONTENT_PAGE_SIZE,
  includeUnpublished = false
) => {
  const graphqlClient = createGraphqlClient(privateKey);
  // entries created after this moment are excluded from the snapshot
  // entirely (rather than merely sorted around), which keeps a concurrent
  // insertion from shifting the offset window and causing an unrelated
  // entry to be skipped or duplicated across pages
  const importStartedAt = Date.now();
  await recoverStaleSiblings(directory);
  const importGuardPromise = isSafeToReplace(directory);

  const spaceProgress = MULTIBAR.create(1, 0);
  spaceProgress.start(1, 0, { name: 'getting space settings' });
  const stagingDir = siblingPath(directory, '.importing-' + process.pid + '-' + Date.now());

  try {
    const settings = (await graphqlClient.chain.query.settings.execute()) || {};

    let draftsIncluded = includeUnpublished;
    let space: SpaceSnapshot;
    let streamed = false;
    let totalEntries = 0;
    const entryCountsByModel: Array<{ name: string; count: number }> = [];
    if (includeUnpublished) {
      // the admin GraphQL API's batched `models { content }` field is the
      // only way to fetch every model's content in one request, but its
      // `includeUnpublished` option is unreliable there: a server-side
      // error resolving any one model's draft content fails the *entire*
      // batched response (confirmed against a real space), and the
      // singular `model(id)` field doesn't support the option at all. The
      // v3 content REST endpoint, called once per model, does support it
      // reliably, and a failure fetching one model's drafts there only
      // affects that model instead of the whole space.
      const apiKey = await graphqlClient.chain.query.id.execute();
      const modelList =
        (await graphqlClient.chain.query.models.execute({
          id: true,
          name: true,
          everything: true,
        })) || [];
      spaceProgress.setTotal(modelList.length);
      const modelsWithoutDrafts: string[] = [];
      const models = await mapWithConcurrency(modelList, DEFAULT_WRITE_CONCURRENCY, async model => {
        let content: ContentEntry[];
        try {
          content = await downloadAllModelContent(
            fetchModelContentPageRest(privateKey, apiKey, model.name, importStartedAt, true),
            model.name,
            { pageSize: limit }
          );
        } catch (e) {
          // isolated to this one model -- every other model's drafts are
          // unaffected, unlike the batched GraphQL query this replaces
          modelsWithoutDrafts.push(model.name);
          content = await downloadAllModelContent(
            fetchModelContentPageRest(privateKey, apiKey, model.name, importStartedAt, false),
            model.name,
            { pageSize: limit }
          );
        }
        spaceProgress.increment(1, { name: `fetched "${model.name}" (${content.length} entries)` });
        return { ...model, content };
      });
      if (modelsWithoutDrafts.length > 0) {
        draftsIncluded = false;
        console.log(
          chalk.yellow(
            `\nCould not fetch unpublished/draft content for ${modelsWithoutDrafts
              .map(name => `"${name}"`)
              .join(', ')} -- the server rejected that request, so ${
              modelsWithoutDrafts.length === 1 ? 'this model was' : 'these models were'
            } imported with published content only. Every other model's drafts were fetched normally.`
          )
        );
      }
      space = { settings, meta: undefined, models };
    } else {
      const apiKey = await graphqlClient.chain.query.id.execute();
      const fetchPage: FetchSpacePage = ({ limit: pageLimit, offset }) =>
        graphqlClient.chain.query.models
          .execute({
            id: true,
            name: true,
            everything: true,
            content: [
              {
                contentQuery: {
                  limit: pageLimit,
                  offset,
                  // createdDate alone isn't a unique key, so two entries created
                  // in the same millisecond would otherwise have unspecified
                  // relative order across page boundaries; id breaks the tie
                  sort: { createdDate: 1, id: 1 },
                  query: { createdDate: { $lte: importStartedAt } },
                },
              },
            ],
          })
          .then(async modelsResult => {
            const models = modelsResult || [];
            // the GraphQL admin API's `content` field turns out to omit
            // `priority` the same way the REST endpoint does -- see
            // fetchPriorityById
            await mapWithConcurrency(models, DEFAULT_WRITE_CONCURRENCY, async model => {
              const content = (model.content || []) as ContentEntry[];
              if (content.length === 0) {
                return;
              }
              const priorityParams = new URLSearchParams({
                apiKey,
                limit: String(pageLimit),
                offset: String(offset),
                'query.createdDate.$lte': String(importStartedAt),
                'sort.createdDate': '1',
                'sort.id': '1',
              });
              mergePriorityById(
                content,
                await fetchPriorityById(privateKey, model.name, priorityParams)
              );
            });
            return { settings, meta: undefined, models };
          }) as Promise<SpacePage>;
      streamed = true;
      // writes each page's entries to the staging directory as they arrive
      // instead of buffering a full space's worth of content bodies in
      // memory until pagination finishes -- see downloadAllSpaceContent
      const stagedModelDirs = new Set<string>();
      const modelEntryIndex = new Map<string, number>();
      const modelBarByDir = new Map<string, cliProgress.Bar>();

      const stageModel = async (model: ModelPage) => {
        const modelName = kebabCase(model.name);
        if (stagedModelDirs.has(modelName)) {
          return modelName;
        }
        stagedModelDirs.add(modelName);
        const everything = model.everything || {};
        // todo why conent is in everything
        const { content: _, ...schema } = everything;
        await fse.outputFile(
          `${stagingDir}/${modelName}/schema.model.json`,
          JSON.stringify(schema, null, 2)
        );
        entryCountsByModel.push({ name: model.name, count: 0 });
        modelEntryIndex.set(modelName, 0);
        const bar = MULTIBAR.create(0, 0, { name: modelName });
        modelBarByDir.set(modelName, bar);
        return modelName;
      };

      const writeStreamedEntries = async (model: ModelPage, entries: ContentEntry[]) => {
        const modelName = await stageModel(model);
        const bar = modelBarByDir.get(modelName)!;
        const counts = entryCountsByModel.find(m => m.name === model.name)!;
        for (const entry of entries) {
          // namespaced and encoded so a caller-supplied id can never collide
          // with schema.model.json or the no-id fallback pattern, and can
          // never escape the model directory via "/" or ".." in the id
          const index = modelEntryIndex.get(modelName)!;
          modelEntryIndex.set(modelName, index + 1);
          const baseName =
            typeof entry.id === 'string' && entry.id
              ? `entry-id-${encodeURIComponent(entry.id)}`
              : `entry-noid-${index}`;
          const filename = `${stagingDir}/${modelName}/${baseName}.json`;
          await fse.outputFile(filename, JSON.stringify(entry, undefined, 2));
          counts.count++;
          totalEntries++;
          bar.setTotal(counts.count);
          bar.increment(1, { name: ` ${modelName}: ${filename} ` });
        }
      };

      // every model is present in the response on every page, regardless of
      // how far its own content has been paginated -- so page 1 already
      // carries the complete model list, which is all the validation below
      // needs. Its entries are held back until that validation passes, so
      // nothing is written to the staging directory before it's confirmed
      // safe to do so, matching the non-streamed path's guarantee.
      let firstPageEntries: Array<{ model: ModelPage; entries: ContentEntry[] }> | null = [];
      let validated = false;
      const validateAndFlushFirstPage = async () => {
        if (validated) {
          return;
        }
        validated = true;
        const buffered = firstPageEntries || [];
        firstPageEntries = null;

        if (!(await importGuardPromise)) {
          throw new Error(
            'Refusing to import into "' +
              directory +
              '": it already contains files that do not look like a previous snapshot from this command ' +
              '(only settings.json and model directories containing schema.model.json are recognized). ' +
              'A successful import fully replaces the output directory contents, so point --output at an empty or dedicated directory to avoid losing unrelated data.'
          );
        }

        const modelNamesByDir = new Map<string, string[]>();
        buffered.forEach(({ model }) => {
          const dirName = kebabCase(model.name);
          modelNamesByDir.set(dirName, [...(modelNamesByDir.get(dirName) || []), model.name]);
        });
        const collisions = [...modelNamesByDir.entries()].filter(
          ([dirName, names]) => names.length > 1 || dirName === ''
        );
        if (collisions.length > 0) {
          throw new Error(
            `Cannot write snapshot: these model names normalize to an unusable or shared directory name: ${collisions
              .map(([dir, names]) => `"${names.join('", "')}" -> "${dir}"`)
              .join('; ')}. Rename the conflicting model(s) before importing.`
          );
        }

        spaceProgress.update(0, { name: 'writing space' });
        for (const { model, entries } of buffered) {
          await writeStreamedEntries(model, entries);
        }
      };

      space = await downloadAllSpaceContent(fetchPage, {
        pageSize: limit,
        onPage: ({ page, total }) =>
          spaceProgress.update(0, {
            name: 'downloading page ' + page + ' (' + total + ' entries so far)',
          }),
        onEntries: async (model, entries, page) => {
          if (!validated) {
            if (page === 1) {
              firstPageEntries!.push({ model, entries });
              return;
            }
            await validateAndFlushFirstPage();
          }
          await writeStreamedEntries(model, entries);
        },
      });
      // an entirely empty space never calls onEntries at all, so validation
      // (which also guards against replacing an unsafe output directory)
      // still needs to happen even when there was nothing to write
      await validateAndFlushFirstPage();
    }

    if (!streamed && !(await importGuardPromise)) {
      throw new Error(
        'Refusing to import into "' +
          directory +
          '": it already contains files that do not look like a previous snapshot from this command ' +
          '(only settings.json and model directories containing schema.model.json are recognized). ' +
          'A successful import fully replaces the output directory contents, so point --output at an empty or dedicated directory to avoid losing unrelated data.'
      );
    }

    // two distinct model names that normalize to the same directory would
    if (!streamed) {
      const modelNamesByDir = new Map<string, string[]>();
      space.models.forEach(model => {
        const dirName = kebabCase(model.name);
        modelNamesByDir.set(dirName, [...(modelNamesByDir.get(dirName) || []), model.name]);
      });
      const collisions = [...modelNamesByDir.entries()].filter(
        ([dirName, names]) => names.length > 1 || dirName === ''
      );
      if (collisions.length > 0) {
        throw new Error(
          `Cannot write snapshot: these model names normalize to an unusable or shared directory name: ${collisions
            .map(([dir, names]) => `"${names.join('", "')}" -> "${dir}"`)
            .join('; ')}. Rename the conflicting model(s) before importing.`
        );
      }
      spaceProgress.update(0, { name: 'writing space' });
      spaceProgress.setTotal(space.models.length);
    }

    await fse.outputFile(
      `${stagingDir}/settings.json`,
      JSON.stringify({ ...space.settings, cloneInfo: space.meta }, undefined, 2)
    );

    if (!streamed) {
      await mapWithConcurrency(space.models, DEFAULT_WRITE_CONCURRENCY, async model => {
        const { content } = model;
        const everything = model.everything || {};
        // todo why conent is in everything
        const { content: _, ...schema } = everything;
        const modelName = kebabCase(model.name);
        const modelProgress = MULTIBAR.create(content.length, 0, { name: modelName });
        if (content.length > 0) {
          modelProgress.start(content.length, 0, { name: modelName });
        }
        await fse.outputFile(
          `${stagingDir}/${modelName}/schema.model.json`,
          JSON.stringify(schema, null, 2)
        );
        await mapWithConcurrency(content, DEFAULT_WRITE_CONCURRENCY, async (entry, index) => {
          // namespaced and encoded so a caller-supplied id can never collide
          // with schema.model.json or the no-id fallback pattern, and can
          // never escape the model directory via "/" or ".." in the id
          const baseName =
            typeof entry.id === 'string' && entry.id
              ? `entry-id-${encodeURIComponent(entry.id)}`
              : `entry-noid-${index}`;
          const filename = `${stagingDir}/${modelName}/${baseName}.json`;
          await fse.outputFile(filename, JSON.stringify(entry, undefined, 2));
          modelProgress.increment(1, { name: ` ${modelName}: ${filename} ` });
        });
        entryCountsByModel.push({ name: model.name, count: content.length });
        totalEntries += content.length;
        spaceProgress.increment();
        modelProgress.stop();
      });
    }

    // the earlier guard check can be a while ago by now -- a full download
    // can take a long time, during which something could have appeared in
    // `directory` since it was last checked. Re-checking fresh right before
    // the actual swap closes that window instead of trusting a stale result.
    if (!(await isSafeToReplace(directory))) {
      throw new Error(
        'Refusing to import into "' +
          directory +
          '": it now contains files that do not look like a previous snapshot from this command ' +
          '(it changed since the initial check). A successful import fully replaces the output ' +
          'directory contents, so point --output at an empty or dedicated directory to avoid losing unrelated data.'
      );
    }

    await swapInStagingDir(stagingDir, directory);

    console.log(chalk.green(`\nImported successfully: ${space.settings.name}`));
    console.log(chalk.green(`  Models: ${space.models.length}`));
    console.log(chalk.green(`  Total content entries: ${totalEntries}`));
    if (debug) {
      entryCountsByModel.forEach(({ name, count }) => {
        console.log(chalk.green(`    ${name}: ${count}`));
      });
    }
    if (includeUnpublished && !draftsIncluded) {
      console.log(
        chalk.yellow(
          '\nThis snapshot does not include unpublished/draft content for every model -- see the warning above.'
        )
      );
    }
  } catch (e) {
    console.log(`\r\n\r\n`);
    console.error(chalk.red('Error importing space'));
    console.error(e);
    // the real output directory is never touched until every write above
    // succeeds (see swapInStagingDir), so a previous good snapshot there is
    // always intact -- only the incomplete staging copy needs cleaning up
    await fse.remove(stagingDir).catch(() => {});
    process.exit(1);
  }

  spaceProgress.stop();
  MULTIBAR.stop();
};

/**
 * Replaces `directory` with the fully-written `stagingDir` only now that
 * every model and entry has been written successfully, so a crash or
 * Ctrl-C at any point before this call leaves a previous snapshot at
 * `directory` completely untouched instead of partially emptied/overwritten.
 */
export const swapInStagingDir = async (stagingDir: string, targetDir: string) => {
  const directory = path.resolve(targetDir);
  const previousDir = siblingPath(directory, '.previous-' + Date.now());
  const hadExisting = await fse.pathExists(directory);
  if (hadExisting) {
    await fse.move(directory, previousDir, { overwrite: true });
  }
  try {
    await fse.move(stagingDir, directory, { overwrite: true });
  } catch (e) {
    if (hadExisting) {
      await fse.move(previousDir, directory, { overwrite: true }).catch(() => {});
    }
    throw e;
  }
  if (hadExisting) {
    await fse.remove(previousDir).catch(() => {});
  }
};

const hashIdsByOrganization = (ids: string[], organizationId: string) => {
  const map: Record<string, string> = {};
  ids.forEach(id => {
    map[id] = createHash('sha256')
      .update(id + organizationId)
      .digest('hex');
  });
  return map;
};

export const newSpace = async (
  privateKey: string,
  directory: string,
  name?: string,
  debug = false
) => {
  const graphqlClient = createGraphqlClient(privateKey);

  const spaceSettings = await readAsJson(`${directory}/settings.json`);
  const failures: Array<{ file: string; model: string; error: string }> = [];
  try {
    // the ids that need remapping into the new space are exactly the ids
    // already recorded in this snapshot -- every model's own id (from its
    // schema.model.json) and every content entry's own id (from its JSON
    // file) -- collecting them here means create no longer depends on the
    // cloneInfo maps the old downloadClone-based import used to write
    const modelDirs = await getDirectories(directory);
    const modelIds: string[] = [];
    const contentIds: string[] = [];
    // include operation-specific context (timestamp + resolved directory path) in the
    // hash for derived IDs so that id-less entries get unique IDs across different
    // newSpace operations, even if the same snapshot directory is used multiple times
    const operationContext = Date.now() + ':' + path.resolve(directory);
    await mapWithConcurrency(modelDirs, DEFAULT_WRITE_CONCURRENCY, async ({ name: modelName }) => {
      const schema = await readAsJson(`${directory}/${modelName}/schema.model.json`);
      if (typeof schema.id === 'string' && schema.id) {
        modelIds.push(schema.id);
      }
      const entryFiles = (await getFiles(`${directory}/${modelName}`)).filter(
        file => file.name !== 'schema.model.json'
      );
      await mapWithConcurrency(entryFiles, DEFAULT_WRITE_CONCURRENCY, async file => {
        const entry = await readAsJson(`${directory}/${modelName}/${file.name}`);
        if (typeof entry.id === 'string' && entry.id) {
          contentIds.push(entry.id);
        }
      });
    });

    const { organization, privateKey: newSpacePrivateKey } = await graphqlClient.chain.mutation
      .createSpace({
        settings: {
          ...omit(spaceSettings, 'cloneInfo'),
          name: name || spaceSettings.name,
        },
      })
      .execute();
    const newSpaceAdminClient = createGraphqlClient(newSpacePrivateKey.key);

    const spaceModelIdsMap = hashIdsByOrganization(modelIds, organization.id);
    const spaceContentIdsMap = hashIdsByOrganization(contentIds, organization.id);
    const replaceIds = (obj: Record<string, unknown>) =>
      traverse(obj).map(function(field) {
        // we keep meta props as is for debugging puprposes
        if (this.key?.includes('@')) {
          return;
        }
        if (spaceModelIdsMap[field]) {
          this.update(spaceModelIdsMap[field]);
        } else if (spaceContentIdsMap[field]) {
          this.update(spaceContentIdsMap[field]);
        }
      });

    const models = modelDirs;
    const writeTasks: Array<{
      modelName: string;
      fileName: string;
      progress: cliProgress.Bar;
    }> = [];
    const modelBars: cliProgress.Bar[] = [];
    let modelsCreated = 0;
    let entriesCreated = 0;

    await mapWithConcurrency(models, DEFAULT_WRITE_CONCURRENCY, async ({ name: modelName }) => {
      let model;
      try {
        const body = replaceField(
          await readAsJson(`${directory}/${modelName}/schema.model.json`),
          organization.id,
          spaceSettings.id
        );
        model = await newSpaceAdminClient.chain.mutation
          .addModel({ body: replaceIds(body) })
          .execute({ id: true, name: true });
      } catch (e) {
        // one model failing to read/create shouldn't take down every other
        // concurrently-running model in this pool -- record it and move on,
        // same as the per-model isolation `overwrite` already has
        failures.push({
          model: modelName,
          file: 'schema.model.json',
          error: e instanceof Error ? e.message : String(e),
        });
        return;
      }
      if (!model) {
        return;
      }
      modelsCreated++;
      const content = (await getFiles(`${directory}/${modelName}`)).filter(
        file => file.name !== 'schema.model.json'
      );
      // sorted by each entry's own `priority` (falling back to createdDate)
      // so the write step below, which preserves this order per model, can
      // reproduce the original list order -- see entryOrderKey above
      const orderedContent = (
        await Promise.all(
          content.map(async contentFile => {
            const entry = await readAsJson(`${directory}/${modelName}/${contentFile.name}`).catch(
              () => null
            );
            return { contentFile, orderKey: entryOrderKey(entry) };
          })
        )
      )
        .sort((a, b) => a.orderKey - b.orderKey)
        .map(({ contentFile }) => contentFile);
      const modelProgress = MULTIBAR.create(content.length, 0, { name: modelName });
      modelBars.push(modelProgress);
      if (content.length > 0) {
        modelProgress.start(content.length, 0, { name: modelName });
      }
      orderedContent.forEach(contentFile => {
        writeTasks.push({ modelName, fileName: contentFile.name, progress: modelProgress });
      });
    });

    const priorityPatchTasks: Array<{ modelName: string; id: string; priority: number }> = [];

    await writeSequentiallyPerModel(writeTasks, async task => {
      const { modelName, fileName, progress } = task;
      let failed = false;
      try {
        const contentJSON = replaceIds(
          replaceField(
            await readAsJson(`${directory}/${modelName}/${fileName}`),
            organization.id,
            spaceSettings.id
          )
        );
        if (typeof contentJSON.id !== 'string' || !contentJSON.id) {
          // an id-less entry (rare, see pagination.ts) has no id for
          // replaceIds to remap, so without this it would be POSTed
          // without one -- a retry after a lost response would then create
          // a duplicate instead of overwriting. Deriving a stable id from
          // the file plus operation context (timestamp + directory) makes
          // the id unique across different newSpace operations, while
          // remaining deterministic within each operation for idempotency.
          contentJSON.id = createHash('sha256')
            .update(modelName + ':' + fileName + ':' + operationContext)
            .digest('hex');
        }
        // The write API's PUT-by-id only updates an existing entry and 404s
        // if it doesn't exist yet -- it does not create one, despite what
        // the docs say. The new space starts empty, so every entry has to
        // be POSTed instead; contentJSON.id (already rehashed to the new
        // space's id by replaceIds above) is honored by POST as the entry's
        // id, and re-POSTing the same id just overwrites that entry rather
        // than creating a duplicate, so retrying after a lost response is
        // safe.
        await postJsonWithRetry({
          fetchImpl: (fetch as unknown) as FetchLike,
          method: 'POST',
          url: `${WRITE_API_ROOT}/${encodeURIComponent(modelName)}`,
          body: contentJSON,
          headers: {
            Authorization: `Bearer ${newSpacePrivateKey.key}`,
          },
          retries: DEFAULT_WRITE_RETRIES,
        });
        if (typeof contentJSON.priority === 'number' && typeof contentJSON.id === 'string') {
          priorityPatchTasks.push({
            modelName,
            id: contentJSON.id,
            priority: contentJSON.priority,
          });
        }
      } catch (e) {
        failed = true;
        failures.push({
          model: modelName,
          file: fileName,
          error: e instanceof Error ? e.message : String(e),
        });
      }
      if (!failed) {
        entriesCreated++;
      }
      progress.increment(1, {
        name: `${modelName}: ${failed ? 'failed to write' : 'wrote'} ${fileName}`,
      });
    });

    modelBars.forEach(bar => bar.stop());

    if (priorityPatchTasks.length > 0) {
      const priorityProgress = MULTIBAR.create(priorityPatchTasks.length, 0, {
        name: 'restoring entry order',
      });
      priorityProgress.start(priorityPatchTasks.length, 0, { name: 'restoring entry order' });
      await applyPriorityPatches(
        priorityPatchTasks,
        newSpacePrivateKey.key,
        () => priorityProgress.increment(1, { name: 'restoring entry order' }),
        (task, e) => {
          failures.push({
            model: task.modelName,
            file: task.id,
            error: `failed to restore original priority: ${e instanceof Error ? e.message : String(e)}`,
          });
        }
      );
      priorityProgress.update(priorityPatchTasks.length, { name: 'restoring entry order' });
      priorityProgress.stop();
    }

    console.log(`\r\n\r\n`);
    console.log(chalk.green(`Created space "${organization.name}":`));
    console.log(chalk.green(`  Models created: ${modelsCreated}`));
    console.log(chalk.green(`  Content entries created: ${entriesCreated}`));
    if (failures.length) {
      console.log(chalk.yellow(`  Failed: ${failures.length} (see below)`));
    }
    if (debug) {
      console.log(chalk.green(`  Public API Key: ${organization.id}`));
    }
    console.log(`\r\n\r\n`);
  } catch (e) {
    console.log(`\r\n\r\n`);
    console.error(chalk.red('Error creating space'));
    console.error(e);
    process.exit(1);
  }

  MULTIBAR.stop();

  if (failures.length) {
    console.log(`\r\n\r\n`);
    console.error(chalk.red(`Failed to write ${failures.length} model(s)/content entries:`));
    failures.forEach(failure => {
      console.error(chalk.red(`  ${failure.model}/${failure.file}: ${failure.error}`));
    });
    process.exit(1);
  }
};

/**
 * Restores a snapshot into an already-existing space: models are upserted by
 * name and content entries by their original id (PUT), so entries already in
 * the target space get overwritten and everything else is created. Entries
 * present in the target space but absent from the snapshot are left alone —
 * this is a merge, not a mirror — unless `prune` is set, in which case any
 * entry belonging to a restored model that isn't in the snapshot is deleted,
 * making the target space's content an exact copy of the snapshot.
 *
 * `dryRun` runs every read (listing models, downloading the target space's
 * current content for prune planning) but skips every mutation, printing a
 * summary of what would have happened instead.
 */
export const overwriteSpace = async (
  privateKey: string,
  directory: string,
  debug = false,
  prune = false,
  skipConfirmation = false,
  dryRun = false
) => {
  const graphqlClient = createGraphqlClient(privateKey);
  // entries created at or after this moment are never candidates for
  // pruning, no matter what the destination re-download below sees —
  // this is what keeps a concurrently-created entry from being deleted
  // in the same run that just created it
  const progressCounts = {
    modelsUpdated: 0,
    modelsCreated: 0,
    entriesWritten: 0,
    entriesPruned: 0,
  };
  const onInterrupt = () => {
    console.log('\r\n\r\n');
    console.error(
      chalk.red(
        `Interrupted before finishing. As of now: ${progressCounts.entriesWritten} content entries were written` +
          (prune ? ` and ${progressCounts.entriesPruned} were pruned` : '') +
          `, with ${failures.length} failure(s). The target space may be in a partially-updated state — re-run to finish syncing it.`
      )
    );
    process.exit(130);
  };

  if (prune && !dryRun && !skipConfirmation) {
    // best-effort identification of the target — confirming the wrong
    // space (e.g. a stale BUILDER_PRIVATE_KEY) is the most dangerous way
    // to misuse --prune, so surface what key/directory are about to be used
    let targetLabel = 'the target space';
    try {
      const settings = await graphqlClient.chain.query.settings.execute();
      const spaceId = await graphqlClient.chain.query.id.execute();
      targetLabel = settings?.name ? `"${settings.name}" (${spaceId})` : `space ${spaceId}`;
    } catch {
      // fall back to the generic label below if the space can't be reached yet
    }
    const confirmed = await confirmAction(
      chalk.yellow(
        `\n--prune will permanently delete content entries in ${targetLabel} that are not present in the local snapshot at "${directory}". This cannot be undone.\nType "yes" to continue: `
      )
    );
    if (!confirmed) {
      console.log(chalk.red('Aborted.'));
      return;
    }
  }
  // capture runStartedAt after confirmation, so entries created during the
  // confirmation window (while the user was deciding) are not protected from
  // pruning -- they should be pruned if absent from the local snapshot, since
  // the user explicitly confirmed the prune operation before they were created
  const runStartedAt = Date.now();
  const failures: Array<{ file: string; model: string; error: string }> = [];
  const plan = { modelsToUpdate: 0, modelsToCreate: 0, entriesToWrite: 0, entriesToPrune: 0 };

  if (!dryRun) {
    process.on('SIGINT', onInterrupt);
  }

  try {
    const rawModels =
      (await graphqlClient.chain.query.models.execute({ id: true, name: true })) || [];
    const existingModels: ExistingModel[] = rawModels
      .map(model => ({ id: model.id, name: model.name }))
      .filter((model): model is ExistingModel => !!model.id && !!model.name);

    // two distinct models in the *target* space can normalize to the same
    // kebab-case name (e.g. "Blog Post" and "blog-post") even though the
    // snapshot's own model names were already checked for this at import
    // time -- planModelSync matches by that normalized name alone, so
    // without this check a snapshot directory could silently update the
    // wrong one of the two, and --prune could delete content that actually
    // belongs to the other, unrelated model
    const existingModelsByDir = new Map<string, ExistingModel[]>();
    existingModels.forEach(model => {
      const dir = kebabCase(model.name);
      existingModelsByDir.set(dir, [...(existingModelsByDir.get(dir) || []), model]);
    });

    const modelDirs = await getDirectories(directory);
    const writeTasks: Array<{
      modelName: string;
      fileName: string;
      entry: ContentEntry;
      progress: cliProgress.Bar;
    }> = [];
    const modelBars: cliProgress.Bar[] = [];
    // only models that already existed in the target space are eligible for
    // pruning — a model that was just created can't have stale content in it
    const localEntryIdsByModel = new Map<string, Set<string>>();

    await mapWithConcurrency(modelDirs, DEFAULT_WRITE_CONCURRENCY, async ({ name: modelName }) => {
      const ambiguousMatches = existingModelsByDir.get(modelName);
      if (ambiguousMatches && ambiguousMatches.length > 1) {
        const matchedNames = ambiguousMatches.map(m => m.name).join(', ');
        const errorMessage =
          String(ambiguousMatches.length) +
          ' models in the target space (' +
          matchedNames +
          ') all normalize to the name ' +
          modelName +
          ', so it is not possible to tell which one the snapshot corresponds to; refusing to sync this model.';
        failures.push({ model: modelName, file: 'schema.model.json', error: errorMessage });
        return;
      }
      const modelPlan = planModelSync(existingModels, modelName);
      try {
        const schema = await readAsJson(`${directory}/${modelName}/schema.model.json`);
        if (modelPlan.action === 'update') {
          if (schema.id && schema.id !== modelPlan.existingId) {
            // the destination model matched by name but has a different id
            // than the one this snapshot was taken from (e.g. the original
            // model was deleted and a new one created with the same name)
            // -- updating it would silently overwrite an unrelated model
            throw new Error(
              'model "' +
                modelName +
                '" matched by name but its id in the target space (' +
                modelPlan.existingId +
                ') does not match the snapshot id (' +
                schema.id +
                ') -- refusing to overwrite what may be a different model'
            );
          }
          plan.modelsToUpdate++;
          if (!dryRun) {
            // the backend rejects updateModel outright if `data` includes
            // `name` or `kind` at all, even set to their current unchanged
            // value -- the model was already matched by name above, so
            // there is nothing to rename here anyway
            await retryAsync(() =>
              graphqlClient.chain.mutation
                .updateModel({
                  body: { id: modelPlan.existingId, data: omit(schema, ['id', 'name', 'kind']) },
                })
                .execute({ id: true, name: true })
            );
            progressCounts.modelsUpdated++;
          }
        } else {
          plan.modelsToCreate++;
          if (!dryRun) {
            // unlike updateModel (which targets a fixed existing id and is
            // safe to retry), addModel creates a new model on every call --
            // retrying after a lost response risks creating a duplicate,
            // the same reason content POSTs elsewhere disable retries too
            await graphqlClient.chain.mutation
              .addModel({ body: schema })
              .execute({ id: true, name: true });
            progressCounts.modelsCreated++;
          }
        }
      } catch (e) {
        // if the model itself couldn't be synced, its content can't be
        // trusted either — record the failure (which also blocks prune,
        // see below) and move on instead of aborting the whole restore
        failures.push({
          model: modelName,
          file: 'schema.model.json',
          error: e instanceof Error ? e.message : String(e),
        });
        return;
      }

      let contentFiles: Array<{ name: string }>;
      try {
        contentFiles = (await getFiles(`${directory}/${modelName}`)).filter(
          file => file.name !== 'schema.model.json'
        );
      } catch (e) {
        // an fs error reading one model's directory (permissions, EMFILE,
        // a mid-run deletion, ...) shouldn't kill the other concurrent
        // workers — record it like any other per-model failure and move on
        failures.push({
          model: modelName,
          file: '(directory listing)',
          error: e instanceof Error ? e.message : String(e),
        });
        return;
      }
      const modelProgress = MULTIBAR.create(contentFiles.length, 0, { name: modelName });
      modelBars.push(modelProgress);
      if (contentFiles.length > 0) {
        modelProgress.start(contentFiles.length, 0, { name: modelName });
      }

      const localIds = new Set<string>();
      const modelWriteTasks: Array<{ fileName: string; entry: ContentEntry }> = [];
      await mapWithConcurrency(contentFiles, DEFAULT_WRITE_CONCURRENCY, async contentFile => {
        let entry;
        try {
          entry = await readAsJson(`${directory}/${modelName}/${contentFile.name}`);
        } catch (e) {
          failures.push({
            model: modelName,
            file: contentFile.name,
            error: e instanceof Error ? e.message : String(e),
          });
          return;
        }
        if (!entry?.id) {
          // an id-less entry (rare, see pagination.ts) would otherwise have
          // to be POSTed, which creates a new entry on every re-run and
          // leaves an ambiguous outcome if the response is ever lost —
          // deriving a stable id from the file lets it be PUT instead,
          // making the write idempotent and safe to retry/re-run
          entry = {
            ...entry,
            id: createHash('sha256')
              .update(`${modelName}:${contentFile.name}`)
              .digest('hex'),
          };
        }
        modelWriteTasks.push({ fileName: contentFile.name, entry });
      });

      // sorted by each entry's own `priority` (falling back to createdDate)
      // so the write step below, which preserves this order per model, can
      // reproduce the original list order -- see entryOrderKey above
      modelWriteTasks.sort((a, b) => entryOrderKey(a.entry) - entryOrderKey(b.entry));

      // two files sharing an id would otherwise race as concurrent writes
      // to the same URL, silently discarding whichever finished first
      const fileByEntryId = new Map<string, string>();
      modelWriteTasks.forEach(({ fileName, entry }) => {
        const id = entry?.id;
        if (id && fileByEntryId.has(id)) {
          failures.push({
            model: modelName,
            file: fileName,
            error: `duplicate id "${id}" also found in ${fileByEntryId.get(
              id
            )} — skipping to avoid a write race`,
          });
          modelProgress.increment(1, { name: `${modelName}: skipped duplicate ${fileName}` });
          return;
        }
        if (id) {
          fileByEntryId.set(id, fileName);
          localIds.add(id);
        }
        writeTasks.push({ modelName, fileName, entry, progress: modelProgress });
      });
      if (prune && modelPlan.action === 'update') {
        localEntryIdsByModel.set(modelName, localIds);
      }
    });

    plan.entriesToWrite = writeTasks.length;

    const priorityPatchTasks: Array<{ modelName: string; id: string; priority: number }> = [];

    await writeSequentiallyPerModel(writeTasks, async task => {
      const { modelName, fileName, entry, progress } = task;
      let failed = false;
      if (!dryRun) {
        try {
          // every entry has an id by this point (a stable one is derived
          // for id-less local entries above), so this always starts as a
          // PUT to that id. Whether PUT-by-id upserts (creates if missing)
          // or only updates and 404s is undocumented and this codebase has
          // disagreed with itself about it elsewhere -- rather than assume
          // either way, a 404 on PUT is treated as "doesn't exist yet" and
          // retried once as a POST (which honors the id already in the
          // body), so the entry ends up created either way
          const { method, url } = buildWriteRequest(modelName, entry);
          try {
            await postJsonWithRetry({
              fetchImpl: (fetch as unknown) as FetchLike,
              method,
              url,
              body: entry,
              headers: {
                Authorization: `Bearer ${privateKey}`,
              },
            });
          } catch (e) {
            if (method === 'PUT' && isHttpErrorWithStatus(e, 404)) {
              await postJsonWithRetry({
                fetchImpl: (fetch as unknown) as FetchLike,
                method: 'POST',
                url: `${WRITE_API_ROOT}/${encodeURIComponent(modelName)}`,
                body: entry,
                headers: {
                  Authorization: `Bearer ${privateKey}`,
                },
              });
            } else {
              throw e;
            }
          }
          if (typeof entry.priority === 'number' && typeof entry.id === 'string') {
            priorityPatchTasks.push({ modelName, id: entry.id, priority: entry.priority });
          }
        } catch (e) {
          failed = true;
          failures.push({
            model: modelName,
            file: fileName,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }
      if (!dryRun && !failed) {
        progressCounts.entriesWritten++;
      }
      progress.increment(1, {
        name: `${modelName}: ${
          dryRun ? 'would write' : failed ? 'failed to write' : 'wrote'
        } ${fileName}`,
      });
    });

    modelBars.forEach(bar => bar.stop());

    if (!dryRun) {
      // both PUT (update) and POST (create-on-404-fallback) are covered by
      // the same unreliable-priority problem `newSpace` hit -- see
      // applyPriorityPatches
      if (priorityPatchTasks.length > 0) {
        const priorityProgress = MULTIBAR.create(priorityPatchTasks.length, 0, {
          name: 'restoring entry order',
        });
        priorityProgress.start(priorityPatchTasks.length, 0, { name: 'restoring entry order' });
        await applyPriorityPatches(
          priorityPatchTasks,
          privateKey,
          () => priorityProgress.increment(1, { name: 'restoring entry order' }),
          (task, e) => {
            failures.push({
              model: task.modelName,
              file: task.id,
              error: `failed to restore original priority: ${e instanceof Error ? e.message : String(e)}`,
            });
          }
        );
        priorityProgress.update(priorityPatchTasks.length, { name: 'restoring entry order' });
        priorityProgress.stop();
      }
    }

    if (prune && !dryRun && failures.length > 0) {
      // pruning now would delete entries based on an incomplete/incorrect
      // view of what the snapshot contains, since some writes didn't land
      console.error(
        chalk.red(
          `Skipping prune: ${failures.length} write(s) failed, so the target space isn't a faithful reflection of the snapshot yet. Fix the failures below and re-run.`
        )
      );
    } else if (prune && localEntryIdsByModel.size > 0) {
      // fetches each pruned model's destination content independently via
      // the v3 content REST endpoint rather than the admin GraphQL API's
      // batched `models { content }` field -- that field's
      // `includeUnpublished` option is unreliable (a server-side error
      // resolving any one model's drafts fails the whole batched request,
      // confirmed against a real space), so a stale draft in one model
      // could silently make every other model's prune check fail too. A
      // failure isolated to one model here just skips pruning drafts for
      // that model, with a warning, instead of the whole run.
      const apiKey = await graphqlClient.chain.query.id.execute();
      const deleteTasks: Array<{ modelName: string; entryId: string }> = [];
      const modelsWithoutDraftPruneCheck: string[] = [];

      await mapWithConcurrency(
        Array.from(localEntryIdsByModel.entries()),
        DEFAULT_WRITE_CONCURRENCY,
        async ([modelDirName, localIds]) => {
          const realName = existingModelsByDir.get(modelDirName)?.[0]?.name ?? modelDirName;
          let destinationContent: ContentEntry[];
          try {
            destinationContent = await downloadAllModelContent(
              fetchModelContentPageRest(privateKey, apiKey, realName, runStartedAt, true),
              realName,
              { pageSize: MAX_CONTENT_PAGE_SIZE }
            );
          } catch (e) {
            modelsWithoutDraftPruneCheck.push(realName);
            destinationContent = await downloadAllModelContent(
              fetchModelContentPageRest(privateKey, apiKey, realName, runStartedAt, false),
              realName,
              { pageSize: MAX_CONTENT_PAGE_SIZE }
            );
          }
          findStaleEntryIds(destinationContent, localIds).forEach(entryId => {
            deleteTasks.push({ modelName: modelDirName, entryId });
          });
        }
      );

      if (modelsWithoutDraftPruneCheck.length > 0) {
        console.log(
          chalk.yellow(
            `\nCould not check draft/unpublished content for staleness in ${modelsWithoutDraftPruneCheck
              .map(name => `"${name}"`)
              .join(', ')} -- the server rejected that request, so stale drafts in ${
              modelsWithoutDraftPruneCheck.length === 1 ? 'that model' : 'those models'
            } won't be pruned this run. Published content was still checked normally.`
          )
        );
      }

      plan.entriesToPrune = deleteTasks.length;

      if (deleteTasks.length > 0) {
        const pruneProgress = MULTIBAR.create(deleteTasks.length, 0, {
          name: 'pruning stale entries',
        });
        pruneProgress.start(deleteTasks.length, 0, { name: 'pruning stale entries' });
        await mapWithConcurrency(deleteTasks, DEFAULT_WRITE_CONCURRENCY, async task => {
          const { modelName, entryId } = task;
          let failed = false;
          if (!dryRun) {
            try {
              const { method, url } = buildDeleteRequest(modelName, entryId);
              await postJsonWithRetry({
                fetchImpl: (fetch as unknown) as FetchLike,
                method,
                url,
                headers: {
                  Authorization: `Bearer ${privateKey}`,
                },
              });
            } catch (e) {
              failed = true;
              failures.push({
                model: modelName,
                file: entryId,
                error: `prune failed: ${e instanceof Error ? e.message : String(e)}`,
              });
            }
          }
          if (!dryRun && !failed) {
            progressCounts.entriesPruned++;
          }
          pruneProgress.increment(1, {
            name: `${modelName}: ${
              dryRun ? 'would prune' : failed ? 'failed to prune' : 'pruned'
            } ${entryId}`,
          });
        });
        pruneProgress.update(deleteTasks.length, { name: 'pruning stale entries' });
        pruneProgress.stop();
      }
    }

    if (dryRun) {
      console.log(`\r\n\r\n`);
      console.log(chalk.cyan('Dry run — no changes were made.'));
      console.log(chalk.cyan(`  Models to update: ${plan.modelsToUpdate}`));
      console.log(chalk.cyan(`  Models to create: ${plan.modelsToCreate}`));
      console.log(chalk.cyan(`  Content entries to write: ${plan.entriesToWrite}`));
      if (prune) {
        console.log(
          chalk.cyan(
            `  Content entries that would be pruned: ${plan.entriesToPrune}${
              failures.length
                ? ' (based on an incomplete snapshot — see failures below, so the real prune plan may differ)'
                : ''
            }`
          )
        );
      }
    } else {
      console.log(`\r\n\r\n`);
      console.log(chalk.green('Overwrite complete:'));
      console.log(chalk.green(`  Models updated: ${progressCounts.modelsUpdated}`));
      console.log(chalk.green(`  Models created: ${progressCounts.modelsCreated}`));
      console.log(chalk.green(`  Content entries written: ${progressCounts.entriesWritten}`));
      if (prune) {
        console.log(chalk.green(`  Content entries pruned: ${progressCounts.entriesPruned}`));
      }
      if (failures.length) {
        console.log(chalk.yellow(`  Failed: ${failures.length} (see below)`));
      }
    }
  } catch (e) {
    console.log(`\r\n\r\n`);
    console.error(chalk.red('Error overwriting space'));
    console.error(e);
    process.exit(1);
  }

  process.off('SIGINT', onInterrupt);
  MULTIBAR.stop();

  if (failures.length) {
    console.log(`\r\n\r\n`);
    console.error(
      chalk.red(
        `${dryRun ? 'Failed to read' : 'Failed to write'} ${failures.length} content entries:`
      )
    );
    failures.forEach(failure => {
      console.error(chalk.red(`  ${failure.model}/${failure.file}: ${failure.error}`));
    });
    process.exit(1);
  }
};
