import { createClient } from './autogen/client/createClient';
import fse from 'fs-extra';
import { kebabCase, omit } from 'lodash';
import chalk from 'chalk';
import { readAsJson, getFiles, getDirectories, replaceField } from './utils';
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
  FetchLike,
  mapWithConcurrency,
  postJsonWithRetry,
} from './write-queue';

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
    const modelOps = space.models.map(async model => {
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
      await Promise.all(
        content.map(async (entry, index) => {
          const filename = `${directory}/${modelName}/${kebabCase(entry.name || '')}-${index}.json`;
          await fse.outputFile(filename, JSON.stringify(entry, undefined, 2));
          modelProgress.increment(1, { name: ` ${modelName}: ${filename} ` });
        })
      );
      spaceProgress.increment();
      modelProgress.stop();
    });
    await Promise.all(modelOps);
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
      try {
        const contentJSON = replaceIds(
          replaceField(
            await readAsJson(`${directory}/${modelName}/${fileName}`),
            organization.id,
            spaceSettings.id
          )
        );
        await postJsonWithRetry({
          fetchImpl: fetch as unknown as FetchLike,
          url: `https://builder.io/api/v1/write/${modelName}`,
          body: contentJSON,
          headers: {
            Authorization: `Bearer ${newSpacePrivateKey.key}`,
          },
        });
      } catch (e) {
        failures.push({
          model: modelName,
          file: fileName,
          error: e instanceof Error ? e.message : String(e),
        });
      }
      progress.increment(1, { name: `${modelName}: wrote ${fileName}` });
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
