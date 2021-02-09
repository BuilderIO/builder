import { createClient } from './autogen/client/createClient';
import fse from 'fs-extra';
import { kebabCase, omit } from 'lodash';
import chalk from 'chalk';
import { readAsJson, getFiles, getDirectories, replaceField } from './utils';
import cliProgress from 'cli-progress';
import { createHash } from 'crypto';
import traverse from 'traverse';

const MULTIBAR = new cliProgress.MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
    format: '|{bar}| {name} | {value}/{total}',
  },
  cliProgress.Presets.shades_grey
);

// todo change this to prod
const root = 'https://qa.builder.io';

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

export const importSpace = async (privateKey: string, directory: string, debug = false) => {
  const graphqlClient = createGraphqlClient(privateKey);

  const spaceProgress = MULTIBAR.create(1, 0);
  spaceProgress.start(1, 0, { name: 'getting space settings' });

  try {
    const space = await graphqlClient.chain.query.downloadClone().execute({
      models: { name: true, everything: true, content: true },
      settings: true,
      meta: true,
    });
    spaceProgress.setTotal(space.models.length);
    await fse.outputFile(
      `${directory}/settings.json`,
      JSON.stringify({ ...space.settings, cloneInfo: space.meta }, undefined, 2)
    );
    const modelOps = space.models.map(async (model, index) => {
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
          const filename = `${directory}/${modelName}/${kebabCase(entry.name)}.json`;
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
    process.exit();
  }

  spaceProgress.stop();
  MULTIBAR.stop();
};

export const newSpace = async (
  privateKey: string,
  directory: string,
  name?: string,
  debug = false
) => {
  const graphqlClient = createGraphqlClient(privateKey);

  const spaceSettings = await readAsJson(`${directory}/settings.json`);
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

    const spaceModelIdsMap = (Object.values(spaceSettings.cloneInfo.modelIdMap) as string[]).reduce<
      Record<string, string>
    >(
      (modelMap, id) => ({
        ...modelMap,
        [id]: createHash('sha256')
          .update(id + organization.id)
          .digest('hex'),
      }),
      {}
    );
    const spaceContentIdsMap = (Object.values(
      spaceSettings.cloneInfo.contentIdMap
    ) as string[]).reduce<Record<string, string>>(
      (contenIdMap, id) => ({
        ...contenIdMap,
        [id]: createHash('sha256')
          .update(id + organization.id)
          .digest('hex'),
      }),
      {}
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
    const modelsPromises = models.map(async ({ name: modelName }) => {
      const body = replaceField(
        await readAsJson(`${directory}/${modelName}/schema.model.json`),
        organization.id,
        spaceSettings.id
      );
      const model = await newSpaceAdminClient.chain.mutation
        .addModel({ body: replaceIds(body) })
        .execute({ id: true, name: true });
      if (model) {
        const content = (await getFiles(`${directory}/${modelName}`)).filter(
          file => file.name !== 'schema.model.json'
        );
        const modelProgress = MULTIBAR.create(content.length, 0, { name: modelName });
        if (content.length > 0) {
          modelProgress.start(content.length, 0, { name: modelName });
        }
        const writeApi = `https://builder.io/api/v1/write/${modelName}`;
        const contentPromises = content.map(async (contentFile, index) => {
          let contentJSON = replaceIds(
            replaceField(
              await readAsJson(`${directory}/${modelName}/${contentFile.name}`),
              organization.id,
              spaceSettings.id
            )
          );
          modelProgress.increment(1, {
            name: `${modelName}: writing ${contentFile.name}`,
          });
          // post content to write api using the new space private api key
          await fetch(writeApi, {
            method: 'POST',
            body: JSON.stringify(contentJSON),
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newSpacePrivateKey.key}`,
            },
          });
        });
        await Promise.all(contentPromises);
        modelProgress.stop();
      }
    });
    await Promise.all(modelsPromises);
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
    process.exit();
  }

  MULTIBAR.stop();
};
