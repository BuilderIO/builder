import { createClient } from './autogen/client/createClient'
import fse from 'fs-extra';
import { kebabCase, omit } from 'lodash';
import chalk from 'chalk';
import { readAsJson, getFiles, getDirectories, replaceField } from './utils'
import cliProgress from 'cli-progress';
import { createHash } from 'crypto';
import traverse from 'traverse';

const multibar = new cliProgress.MultiBar({
  clearOnComplete: false,
  hideCursor: true,
  format: '|{bar}| {name} | {value}/{total}',

}, cliProgress.Presets.shades_grey);

// todo change this to prod
const root = 'https://qa.builder.io'

export const importSpace = async (privateKey: string, directory: string, debug = false) => {
  const graphqlClient = createClient({
    fetcher: ({ query, variables }, fetch, qs) =>
      fetch(`${root}/api/v2/admin?${qs.stringify({ query, variables })}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${privateKey}`,
        },
      }).then(r => r.json()),
  })

  const spaceProgress = multibar.create(1, 0);
  spaceProgress.start(1, 0, { name: 'getting space settings'});;

  try {
    const space = await graphqlClient.chain.query.downloadClone().execute({ models: { name: true, everything: true, content: true }, settings: true, meta: true});
    spaceProgress.setTotal(space.models.length);
    let message = ''
    fse.outputFileSync(`./${directory}/settings.json`, JSON.stringify({...space.settings, cloneInfo: space.meta}, undefined, 2));
    space.models.forEach((model, index) => {
      message += `${model.everything.name}${ index !== (space.models.length -1) ? ',' : ''}`
      spaceProgress.update(index + 1,  { name: message })
      const { content, everything } = model;
      // todo why conent is in everything
      const { content: _ , ...schema } = everything;
      const modelName = kebabCase(model.name)
      fse.emptyDirSync(`./${directory}/${modelName}`)
      fse.outputFileSync(`./${directory}/${modelName}/schema.model.json`, JSON.stringify(schema, null, 2))
      content.forEach((entry, contentIndex) => {
        const filename = `./${directory}/${modelName}/${kebabCase(entry.name)}.json`;
        fse.outputFileSync(filename, JSON.stringify(entry, undefined, 2));
      })
    });
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
  multibar.stop();
}


export const newSpace = async (privateKey: string, directory: string, name?: string, debug = false) => {
  const graphqlClient = createClient({
    fetcher: ({ query, variables }, fetch, qs) =>
      fetch(`${root}/api/v2/admin`, {
        method: 'POST',
        body: JSON.stringify({ query, variables}),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${privateKey}`,
        },
      }).then(r => r.json()).catch((err) => { throw err}),
  })

  const spaceSettings = readAsJson(`./${directory}/settings.json`);
  try {
    const { organization, privateKey: newSpacePrivateKey } = await graphqlClient.chain.mutation.createSpace({ settings: {
      ...omit(spaceSettings, 'cloneInfo'),
      name: name,
    }}).execute();
    const newSpaceAdminClient = createClient({
      fetcher: ({ query, variables }, fetch, qs) => {
        return fetch(`${root}/api/v2/admin`, {
          method: 'POST',
          body: JSON.stringify({ query, variables}),
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${newSpacePrivateKey.key}`,
          },
        }).then(r => r.json())
      }
    });
  
    const models = getDirectories(`${directory}`);
    const spaceModelIdsMap = (Object.values(spaceSettings.cloneInfo.modelIdMap) as string[]).reduce<Record<string, string>>((modelMap, id) => ({
      ...modelMap,
      [id]: createHash('sha256').update(id + organization.id).digest('hex')
    }), {})
  
    const spaceContentIdsMap = (Object.values(spaceSettings.cloneInfo.contentIdMap) as string[]).reduce<Record<string, string>>((contenIdMap, id) => ({
      ...contenIdMap,
      [id]: createHash('sha256').update(id + organization.id).digest('hex')
    }), {})
  
    const replaceIds = (obj: any) => traverse(obj).map(function(field) {
      // we keep meta props as is for debugging puprposes
      if (this.key?.includes('@')) {
        return;
      }
      if (spaceModelIdsMap[field]) {
        this.update(spaceModelIdsMap[field]);
      } else if (spaceContentIdsMap[field]) {
        this.update(spaceContentIdsMap[field]);
      }    
    })
  
    const modelPromises = models.map(async ({ name: modelName}) => {
      const body = replaceField(readAsJson(`./${directory}/${modelName}/schema.model.json`), organization.id, spaceSettings.id);
      const model = await newSpaceAdminClient.chain.mutation.addModel({body: replaceIds(body)}).execute({ id: true, name: true });
      if (model) {
      const content = getFiles(`./${directory}/${modelName}`).filter(file => file.name !== 'schema.model.json');
      const modelProgress = multibar.create(content.length, 0)
      modelProgress.start(content.length, 0);
      const writeApi = `https://builder.io/api/v1/write/${modelName}`;
      const contentPromises = content.map(async (contentFile, index) => {
        let contentJSON = replaceIds(replaceField(readAsJson(`./${directory}/${modelName}/${contentFile.name}`), organization.id, spaceSettings.id));
        modelProgress.update(index + 1,{ name: `writing ${contentFile.name} - ${contentJSON.id} on ${modelName}`})
        // post content to write api using the new space private api key
        await fetch(writeApi, {
          method: 'POST',
          body: JSON.stringify(contentJSON),
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${newSpacePrivateKey.key}`,
          }
        })
      })
      await Promise.all(contentPromises);
      }
    })
    await Promise.all(modelPromises);
    if (debug) {
      console.log(chalk.green('created and cloned successfully ', organization.id, organization.name));
    }  
  } catch(e) {
    console.log(`\r\n\r\n`);
    console.error(chalk.red('Error creating space'));
    console.error(e);
    process.exit();
  }

  multibar.stop();
}

  