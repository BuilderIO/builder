import { createClient } from './autogen/client/createClient';
import path from 'path';
import fse from 'fs-extra';
import { kebabCase, omit } from 'lodash';
import chalk from 'chalk';
import { readAsJson, getFiles, getDirectories, replaceField, confirmAction } from './utils';
import cliProgress from 'cli-progress';
import { createHash } from 'crypto';
import traverse from 'traverse';
import {
  ContentEntry,
  downloadAllSpaceContent,
  FetchSpacePage,
  MAX_CONTENT_PAGE_SIZE,
  SpacePage,
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
 * A model directory in a real snapshot only ever contains JSON files (one
 * `schema.model.json` plus `entry-*.json` content files, see importSpace's
 * writer below) -- checking for the filename alone would let an unrelated
 * directory that merely happens to contain a file called `schema.model.json`
 * (e.g. from an unrelated tool or project template) pass as a snapshot too.
 * Checking every filename ends in `.json` is essentially free (it reuses the
 * directory listing already read below) and rules out a real project
 * directory, which will almost always have non-JSON files alongside it.
 * Parsing is only done for schema.model.json itself -- doing that for every
 * content file too would make this guard re-read and re-parse an entire
 * large snapshot's worth of entries on every single re-run, just to prove
 * something importSpace already wrote correctly the first time.
 */
const looksLikeSnapshotModelDir = async (dir: string): Promise<boolean> => {
  const entries = await fse.readdir(dir, { withFileTypes: true });
  if (!entries.every(entry => entry.isFile() && entry.name.endsWith('.json'))) {
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
    if (entry.isFile() && entry.name === 'settings.json') {
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
 * interrupts a run before it gets that far) leaves leftover sibling
 * directories next to `directory`. An `.importing-*` sibling is always safe
 * to discard -- it's an incomplete staging copy that never got swapped in.
 * A `.previous-*` sibling is normally just debris from a successful run
 * whose final cleanup step didn't finish (also safe to discard) -- unless
 * `directory` itself is missing, which means the crash happened *between*
 * moving it aside and moving the new staging copy into place. In that case
 * the `.previous-*` sibling is the last known-good snapshot, so it's
 * restored instead of discarded: without this, a crash in that narrow
 * window (which can be minutes wide on a network-mounted output path,
 * where moves fall back to copy+delete) would otherwise make a snapshot
 * that was already safely on disk appear to have vanished.
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

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith(`${base}${IMPORTING_PREFIX}`)) {
      continue;
    }
    await fse.remove(path.join(parent, entry.name)).catch(() => {});
  }

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

export const importSpace = async (
  privateKey: string,
  directory: string,
  debug = false,
  limit = MAX_CONTENT_PAGE_SIZE
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
                // the content API defaults to published-only, which would
                // silently drop draft entries from the snapshot — a backup
                // that can't restore unpublished work isn't a real backup
                options: { includeUnpublished: true },
              },
            },
          ],
        })
        .then(models => ({ settings, meta: undefined, models: models || [] })) as Promise<
        SpacePage
      >;

    const space = await downloadAllSpaceContent(fetchPage, {
      pageSize: limit,
      onPage: ({ page, total }) =>
        spaceProgress.update(0, {
          name: 'downloading page ' + page + ' (' + total + ' entries so far)',
        }),
    });

    if (!(await importGuardPromise)) {
      throw new Error(
        'Refusing to import into "' +
          directory +
          '": it already contains files that do not look like a previous snapshot from this command ' +
          '(only settings.json and model directories containing schema.model.json are recognized). ' +
          'A successful import fully replaces the output directory contents, so point --output at an empty or dedicated directory to avoid losing unrelated data.'
      );
    }

    // two distinct model names that normalize to the same directory would
    // otherwise race on outputFile below and silently corrupt or drop one
    // of the two models — fail loudly before writing anything.
    // A name that normalizes to '' (e.g. punctuation-only) would target the
    // snapshot root itself, so it's rejected the same way.
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
    await fse.outputFile(
      `${stagingDir}/settings.json`,
      JSON.stringify({ ...space.settings, cloneInfo: space.meta }, undefined, 2)
    );
    let totalEntries = 0;
    const entryCountsByModel: Array<{ name: string; count: number }> = [];
    await mapWithConcurrency(space.models, DEFAULT_WRITE_CONCURRENCY, async model => {
      const { content } = model;
      const everything = model.everything || {};
      // todo why conent is in everything
      const { content: _, ...schema } = everything;
      const modelName = kebabCase(model.name);
      const modelProgress = MULTIBAR.create(content.length, 0, { name: modelName });
      if (content.length > 0) {
        modelProgress.start(content.length, 0);
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

    await swapInStagingDir(stagingDir, directory);

    console.log(chalk.green(`\nImported successfully: ${space.settings.name}`));
    console.log(chalk.green(`  Models: ${space.models.length}`));
    console.log(chalk.green(`  Total content entries: ${totalEntries}`));
    if (debug) {
      entryCountsByModel.forEach(({ name, count }) => {
        console.log(chalk.green(`    ${name}: ${count}`));
      });
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
      const content = (await getFiles(`${directory}/${modelName}`)).filter(
        file => file.name !== 'schema.model.json'
      );
      const modelProgress = MULTIBAR.create(content.length, 0, { name: modelName });
      modelBars.push(modelProgress);
      if (content.length > 0) {
        modelProgress.start(content.length, 0, { name: modelName });
      }
      content.forEach(contentFile => {
        writeTasks.push({ modelName, fileName: contentFile.name, progress: modelProgress });
      });
    });

    // A single bounded pool across every model: writing thousands of entries
    // with an unbounded Promise.all gets rate limited and drops content.
    await mapWithConcurrency(writeTasks, DEFAULT_WRITE_CONCURRENCY, async task => {
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
      } catch (e) {
        failed = true;
        failures.push({
          model: modelName,
          file: fileName,
          error: e instanceof Error ? e.message : String(e),
        });
      }
      progress.increment(1, {
        name: `${modelName}: ${failed ? 'failed to write' : 'wrote'} ${fileName}`,
      });
    });

    modelBars.forEach(bar => bar.stop());

    if (debug) {
      console.log(`\r\n\r\n`);
      console.log(
        chalk.green(`Your new space "${organization.name}" public API Key: ${organization.id}`)
      );
      console.log(`\r\n\r\n`);
    }
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
  const runStartedAt = Date.now();
  const progressCounts = { entriesWritten: 0, entriesPruned: 0 };
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

    await mapWithConcurrency(writeTasks, DEFAULT_WRITE_CONCURRENCY, async task => {
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

    if (prune && !dryRun && failures.length > 0) {
      // pruning now would delete entries based on an incomplete/incorrect
      // view of what the snapshot contains, since some writes didn't land
      console.error(
        chalk.red(
          `Skipping prune: ${failures.length} write(s) failed, so the target space isn't a faithful reflection of the snapshot yet. Fix the failures below and re-run.`
        )
      );
    } else if (prune && localEntryIdsByModel.size > 0) {
      // uses the same real-id `models` field importSpace does (see the
      // comment there) rather than `downloadClone` -- comparing local
      // snapshot ids (also real ids) against ids that are freshly minted
      // on every call would make every entry look stale and get pruned
      const destinationFetchPage: FetchSpacePage = ({ limit: pageLimit, offset }) =>
        graphqlClient.chain.query.models
          .execute({
            id: true,
            name: true,
            content: [
              {
                contentQuery: {
                  limit: pageLimit,
                  offset,
                  // id tiebreaker matches the import query -- createdDate alone
                  // isn't unique, so ties could otherwise be split inconsistently
                  // across page boundaries and leave a stale entry un-pruned
                  sort: { createdDate: 1, id: 1 },
                  // never consider an entry for pruning if it was created after
                  // this run started — otherwise something an editor creates
                  // while the restore/prune is in flight can look "not in the
                  // snapshot" and get deleted moments after it was made
                  query: { createdDate: { $lte: runStartedAt } },
                  // match the import query so a stale draft entry is still
                  // recognized as stale and pruned, instead of being invisible
                  // to the diff and left behind indefinitely
                  options: { includeUnpublished: true },
                },
              },
            ],
          })
          .then(models => ({
            settings: undefined,
            meta: undefined,
            models: models || [],
          })) as Promise<SpacePage>;

      const destination = await downloadAllSpaceContent(destinationFetchPage, {
        pageSize: MAX_CONTENT_PAGE_SIZE,
      });

      const deleteTasks: Array<{ modelName: string; entryId: string }> = [];
      destination.models.forEach(model => {
        const modelDirName = kebabCase(model.name);
        const localIds = localEntryIdsByModel.get(modelDirName);
        if (!localIds) {
          return;
        }
        findStaleEntryIds(model.content, localIds).forEach(entryId => {
          deleteTasks.push({ modelName: modelDirName, entryId });
        });
      });

      plan.entriesToPrune = deleteTasks.length;

      if (deleteTasks.length > 0) {
        const pruneProgress = MULTIBAR.create(deleteTasks.length, 0, {
          name: 'pruning stale entries',
        });
        pruneProgress.start(deleteTasks.length, 0);
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
    } else if (debug) {
      console.log(chalk.green('Overwrite complete'));
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
