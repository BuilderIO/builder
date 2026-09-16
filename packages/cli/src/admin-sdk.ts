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

  const spaceProgress = MULTIBAR.create(1, 0);
  spaceProgress.start(1, 0, { name: 'getting space settings' });

  try {
    const fetchPage: FetchSpacePage = ({ limit: pageLimit, offset }) =>
      graphqlClient.chain.query
        .downloadClone({
          contentQuery: {
            limit: pageLimit,
            offset,
          },
        })
        .execute({
          models: { name: true, everything: true, content: true },
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

    spaceProgress.update(0, { name: 'writing space' });
    spaceProgress.setTotal(space.models.length);
    await fse.outputFile(
      `${directory}/settings.json`,
      JSON.stringify({ ...space.settings, cloneInfo: space.meta }, undefined, 2)
    );
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
        const filename = `${directory}/${modelName}/${kebabCase(entry.name || '')}-${index}.json`;
        await fse.outputFile(filename, JSON.stringify(entry, undefined, 2));
        modelProgress.increment(1, { name: ` ${modelName}: ${filename} ` });
      });
      spaceProgress.increment();
      modelProgress.stop();
    });
    if (debug) {
      console.log(chalk.green('Imported successfully ', space.settings.name));
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
  if (prune && !dryRun && !skipConfirmation) {
    const confirmed = await confirmAction(
      chalk.yellow(
        '\n--prune will permanently delete content entries in the target space that are not present in the local snapshot. This cannot be undone.\nType "yes" to continue: '
      )
    );
    if (!confirmed) {
      console.log(chalk.red('Aborted.'));
      return;
    }
  }

  const graphqlClient = createGraphqlClient(privateKey);
  const failures: Array<{ file: string; model: string; error: string }> = [];
  const plan = { modelsToUpdate: 0, modelsToCreate: 0, entriesToWrite: 0, entriesToPrune: 0 };

  try {
    const rawModels = (await graphqlClient.chain.query.models.execute({ id: true, name: true })) || [];
    const existingModels: ExistingModel[] = rawModels
      .map(model => ({ id: model.id, name: model.name }))
      .filter((model): model is ExistingModel => !!model.id && !!model.name);

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
      const modelPlan = planModelSync(existingModels, modelName);
      try {
        const schema = await readAsJson(`${directory}/${modelName}/schema.model.json`);
        if (modelPlan.action === 'update') {
          plan.modelsToUpdate++;
          if (!dryRun) {
            await graphqlClient.chain.mutation
              .updateModel({ body: { id: modelPlan.existingId, data: omit(schema, 'id') } })
              .execute({ id: true, name: true });
          }
        } else {
          plan.modelsToCreate++;
          if (!dryRun) {
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

      const contentFiles = (await getFiles(`${directory}/${modelName}`)).filter(
        file => file.name !== 'schema.model.json'
      );
      const modelProgress = MULTIBAR.create(contentFiles.length, 0, { name: modelName });
      modelBars.push(modelProgress);
      if (contentFiles.length > 0) {
        modelProgress.start(contentFiles.length, 0, { name: modelName });
      }

      const localIds = new Set<string>();
      await Promise.all(
        contentFiles.map(async contentFile => {
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
          if (entry?.id) {
            localIds.add(entry.id);
          }
          writeTasks.push({ modelName, fileName: contentFile.name, entry, progress: modelProgress });
        })
      );
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
          const { method, url } = buildWriteRequest(modelName, entry);
          const response = await postJsonWithRetry({
            fetchImpl: fetch as unknown as FetchLike,
            method,
            url,
            body: entry,
            headers: {
              Authorization: `Bearer ${privateKey}`,
            },
            // POST creates a new entry every time it's called, so retrying it
            // after a lost response risks creating a duplicate entry
            retries: method === 'POST' ? 0 : DEFAULT_WRITE_RETRIES,
          });
          if (!entry?.id) {
            // this entry had no id locally, so it was POSTed and given a new
            // server-assigned id — that id has to be added to the keep set
            // now, otherwise the entry we just restored looks orphaned to
            // the prune phase below and gets deleted in the same run
            const keepIds = localEntryIdsByModel.get(modelName);
            if (keepIds) {
              const created = await response
                .text()
                .then(text => JSON.parse(text))
                .catch(() => undefined);
              if (created?.id) {
                keepIds.add(created.id);
              }
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
          .downloadClone({ contentQuery: { limit: pageLimit, offset } })
          .execute({
            models: { name: true, content: true },
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
        console.log(chalk.cyan(`  Content entries that would be pruned: ${plan.entriesToPrune}`));
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

  MULTIBAR.stop();

  if (!dryRun && failures.length) {
    console.log(`\r\n\r\n`);
    console.error(chalk.red(`Failed to write ${failures.length} content entries:`));
    failures.forEach(failure => {
      console.error(chalk.red(`  ${failure.model}/${failure.file}: ${failure.error}`));
    });
    process.exit(1);
  }
};
