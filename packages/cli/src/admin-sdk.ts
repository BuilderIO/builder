import { createClient } from './autogen/client/createClient';
import fse from 'fs-extra';
import { kebabCase, omit } from 'lodash';
import chalk from 'chalk';
import { readAsJson, getFiles, getDirectories, replaceField, confirmAction } from './utils';
import cliProgress from 'cli-progress';
import { createHash } from 'crypto';
import traverse from 'traverse';
import {
  downloadAllSpaceContent,
  FetchSpacePage,
  MAX_CONTENT_PAGE_SIZE,
  SpacePage,
} from './pagination';
import {
  DEFAULT_WRITE_CONCURRENCY,
  DEFAULT_WRITE_RETRIES,
  FetchLike,
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

const createGraphqlClient = (privateKey: string) =>
  createClient({
    fetcher: ({ query, variables }, fetch, qs) =>
      fetch(`${root}/api/v2/admin`, {
        method: 'POST',
        body: JSON.stringify({ query, variables }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${privateKey}`,
        },
      }).then(r => r.json()),
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

  const spaceProgress = MULTIBAR.create(1, 0);
  spaceProgress.start(1, 0, { name: 'getting space settings' });

  try {
    const fetchPage: FetchSpacePage = ({ limit: pageLimit, offset }) =>
      graphqlClient.chain.query
        .downloadClone({
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
        })
        .execute({
          models: { id: true, name: true, everything: true, content: true },
          settings: true,
          meta: true,
        }) as Promise<SpacePage>;

    const space = await downloadAllSpaceContent(fetchPage, {
      pageSize: limit,
      onPage: ({ page, total }) =>
        spaceProgress.update(0, {
          name: 'downloading page ' + page + ' (' + total + ' entries so far)',
        }),
    });

    // two distinct model names that normalize to the same directory would
    // otherwise race on fse.emptyDir/outputFile below and silently corrupt
    // or drop one of the two models — fail loudly before writing anything.
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
    // remove leftover directories from a previous import of a model that's
    // since been deleted/renamed, so `overwrite` can't resurrect it later —
    // scoped to subdirectories that look like a prior import actually wrote
    // (i.e. contain a schema.model.json) so reusing an unrelated directory
    // as the output path can never delete unrelated files
    const newModelDirNames = new Set(space.models.map(model => kebabCase(model.name)));
    const existingDirs = await getDirectories(directory).catch(() => []);
    for (const dirent of existingDirs) {
      if (newModelDirNames.has(dirent.name)) {
        continue;
      }
      const staleModelDir = `${directory}/${dirent.name}`;
      if (await fse.pathExists(`${staleModelDir}/schema.model.json`)) {
        await fse.remove(staleModelDir);
      }
    }
    await fse.outputFile(
      `${directory}/settings.json`,
      JSON.stringify({ ...space.settings, cloneInfo: space.meta }, undefined, 2)
    );
    let totalEntries = 0;
    const entryCountsByModel: Array<{ name: string; count: number }> = [];
    await mapWithConcurrency(space.models, DEFAULT_WRITE_CONCURRENCY, async model => {
      const { content, everything } = model;
      // todo why conent is in everything
      const { content: _, ...schema } = everything;
      const modelName = kebabCase(model.name);
      await fse.emptyDir(`${directory}/${modelName}`);
      const modelProgress = MULTIBAR.create(content.length, 0, { name: modelName });
      if (content.length > 0) {
        modelProgress.start(content.length, 0);
      }
      await fse.outputFile(
        `${directory}/${modelName}/schema.model.json`,
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
        const filename = `${directory}/${modelName}/${baseName}.json`;
        await fse.outputFile(filename, JSON.stringify(entry, undefined, 2));
        modelProgress.increment(1, { name: ` ${modelName}: ${filename} ` });
      });
      entryCountsByModel.push({ name: model.name, count: content.length });
      totalEntries += content.length;
      spaceProgress.increment();
      modelProgress.stop();
    });
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
    process.exit(1);
  }

  spaceProgress.stop();
  MULTIBAR.stop();
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
    const { organization, privateKey: newSpacePrivateKey } = await graphqlClient.chain.mutation
      .createSpace({
        settings: {
          ...omit(spaceSettings, 'cloneInfo'),
          name: name || spaceSettings.name,
        },
      })
      .execute();
    const newSpaceAdminClient = createGraphqlClient(newSpacePrivateKey.key);

    const spaceModelIdsMap = hashIdsByOrganization(
      Object.values(spaceSettings.cloneInfo.modelIdMap) as string[],
      organization.id
    );
    const spaceContentIdsMap = hashIdsByOrganization(
      Object.values(spaceSettings.cloneInfo.contentIdMap) as string[],
      organization.id
    );
    const replaceIds = (obj: any) =>
      traverse(obj).map(function (field) {
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

    const models = await getDirectories(`${directory}`);
    const writeTasks: Array<{ modelName: string; fileName: string; progress: cliProgress.Bar }> =
      [];
    const modelBars: cliProgress.Bar[] = [];

    await mapWithConcurrency(models, DEFAULT_WRITE_CONCURRENCY, async ({ name: modelName }) => {
      const body = replaceField(
        await readAsJson(`${directory}/${modelName}/schema.model.json`),
        organization.id,
        spaceSettings.id
      );
      const model = await newSpaceAdminClient.chain.mutation
        .addModel({ body: replaceIds(body) })
        .execute({ id: true, name: true });
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
        // PUT-by-id instead of POST: contentJSON.id was already rehashed to
        // the new space's id by replaceIds above, and since the new space
        // starts empty this has the same effect as POST but makes a retry
        // after a timeout/5xx safe instead of risking a duplicate entry.
        const { method, url } = buildWriteRequest(modelName, contentJSON);
        await postJsonWithRetry({
          fetchImpl: fetch as unknown as FetchLike,
          method,
          url,
          body: contentJSON,
          headers: {
            Authorization: `Bearer ${newSpacePrivateKey.key}`,
          },
          // POST creates a new entry every time it's called, so retrying it
          // after a lost response (vs. a request that never reached the
          // server) risks creating a duplicate entry
          retries: method === 'POST' ? 0 : DEFAULT_WRITE_RETRIES,
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
    console.error(chalk.red(`Failed to write ${failures.length} content entries:`));
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
    const rawModels = (await graphqlClient.chain.query.models.execute({ id: true, name: true })) || [];
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
      entry: any;
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
            await retryAsync(() =>
              graphqlClient.chain.mutation
                .updateModel({ body: { id: modelPlan.existingId, data: omit(schema, 'id') } })
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
            await graphqlClient.chain.mutation.addModel({ body: schema }).execute({ id: true, name: true });
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
      const modelWriteTasks: Array<{ fileName: string; entry: any }> = [];
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
            id: createHash('sha256').update(`${modelName}:${contentFile.name}`).digest('hex'),
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
            error: `duplicate id "${id}" also found in ${fileByEntryId.get(id)} — skipping to avoid a write race`,
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
          // for id-less local entries above), so this is always a PUT
          // upsert -- idempotent and safe to retry or re-run
          const { method, url } = buildWriteRequest(modelName, entry);
          await postJsonWithRetry({
            fetchImpl: fetch as unknown as FetchLike,
            method,
            url,
            body: entry,
            headers: {
              Authorization: `Bearer ${privateKey}`,
            },
          });
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
        name: `${modelName}: ${dryRun ? 'would write' : failed ? 'failed to write' : 'wrote'} ${fileName}`,
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
      const destinationFetchPage: FetchSpacePage = ({ limit: pageLimit, offset }) =>
        graphqlClient.chain.query
          .downloadClone({
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
          })
          .execute({
            models: { id: true, name: true, content: true },
            settings: false,
            meta: false,
          }) as Promise<SpacePage>;

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
                fetchImpl: fetch as unknown as FetchLike,
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
            name: `${modelName}: ${dryRun ? 'would prune' : failed ? 'failed to prune' : 'pruned'} ${entryId}`,
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
      chalk.red(`${dryRun ? 'Failed to read' : 'Failed to write'} ${failures.length} content entries:`)
    );
    failures.forEach(failure => {
      console.error(chalk.red(`  ${failure.model}/${failure.file}: ${failure.error}`));
    });
    process.exit(1);
  }
};
