import pkg from '../package.json';
import { Builder } from '@builder.io/react';
import appState from '@builder.io/app-context';
import { debounce, omit } from 'lodash';
import dedent from 'dedent';
// ID string should match package name.
const pluginId = pkg.name;

Builder.register('plugin', {
  id: pluginId,
  name: 'PreviewLogic',
  settings: [
    {
      name: 'previewSettings',
      type: 'list',
      defaultValue: [],
      subFields: [
        {
          name: 'model',
          type: 'text',
          enum: appState.models.result.map((model: any) => ({
            label: model.name,
            value: model.id,
          })),
          required: true,
        },
        {
          name: 'code',
          type: 'javascript',
          defaultValue: dedent(`
          /*
          * run any logic you like, you can await fetch here
          * const settings = await fetch('...').then(res => res.json());
          * 
          * make sure to always return a string representing preview url at the end
          * 
          * Available objects:
          * content: a json representation fo the current state of content, access properties directly for example: content.data.title
          * space: the space settings: siteUrl, name, publicKey
          * targeting: an object represeting the content targeting settings, for example: targeting.urlPath
          * 
          * Example:
          * 
          * return space.siteUrl + targeting.urlPath
          */
          `),
        },
      ],
    },
  ],
});

interface ContentEditorActions {
  updatePreviewUrl: (url: string) => void;
  safeReaction<T>(
    watchFunction: () => T,
    reactionFunction: (arg: T) => void,
    options?: {
      fireImmediately: true;
    }
  ): void;
}

interface PreviewSetting {
  model: string;
  code: string;
}

Builder.register('editor.onLoad', ({ safeReaction, updatePreviewUrl }: ContentEditorActions) => {
  safeReaction(
    () => appState.designerState.editingContentModel?.modelId,
    modelId => {
      if (modelId) {
        const previewSettings: Array<PreviewSetting> = appState.user.organization?.value.settings.plugins
          .get(pluginId)
          ?.toJSON()?.previewSettings;

        const currentPreviewSetting = previewSettings?.find(logic => logic.model === modelId);

        if (currentPreviewSetting) {
          safeReaction(
            () => {
              const { data, query } = appState.designerState.editingContentModel.toJSON();
              // do not watch blocks or code / style changes
              return JSON.stringify({
                data: omit(data, [
                  'jsCode',
                  'cssCode',
                  'responsiveStyles',
                  'blocks',
                  'blocksString',
                ]),
                query,
              });
            },
            debounce(async () => {
              const content = appState.designerState.editingContentModel.toJSON();
              const space = {
                siteUrl: appState.user.organization.value?.siteUrl,
                publicKey: appState.user.apiKey,
                name: appState.user.organization.value?.name,
              };

              const targeting = (content.query as any[]).reduce(
                (acc, q) => ({
                  ...acc,
                  [q.property]: q.value,
                }),
                {}
              );

              const fn = new Function(
                'content',
                'targeting',
                'space',
                `
                  async function code() {
                    ${currentPreviewSetting.code}
                  }

                  return code();
                `
              );

              try {
                let result = fn(content, targeting, space);

                if (result && result.then) {
                  result = await result;
                }
                const previewUrl = appState.designerState.editingContentModel.previewUrl;
                if (result !== previewUrl) {
                  updatePreviewUrl(result);
                  appState.snackBar.show(`Previewing ${result}`);
                }
              } catch (err) {
                console.error(' error running preview logic plugin', err);
              }
            }, 400)
          );
        }
      }
    }
  );
});
