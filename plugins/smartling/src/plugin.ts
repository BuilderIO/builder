import { registerCommercePlugin as registerPlugin } from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';
import appState from '@builder.io/app-context';
import isEqual from 'lodash/isEqual';
import { getTranslationModelTemplate, getTranslationModel } from './model-template';
import { registerBulkAction, registerContentAction, registerElementAction } from './plugin-helpers';
import { SmartlingApi } from './smartling';

registerPlugin(
  {
    name: 'Smartling',
    id: pkg.name,
    settings: [
      {
        name: 'projectId',
        type: 'string',
        required: true,
      },
      {
        name: 'userId',
        type: 'string',
        required: true,
      },
      {
        name: 'tokenSecret',
        type: 'string',
        required: true,
      },
    ],
    onSave: async actions => {
      const pluginPrivateKey = await appState.globalState.getPluginPrivateKey(pkg.name);
      if (!getTranslationModel()) {
        actions.addModel(
          getTranslationModelTemplate(pluginPrivateKey, appState.user.apiKey, pkg.name) as any
        );
      }
    },
    ctaText: `Connect your Smartling project`,
  },
  async () => {
    const pluginPrivateKey = await appState.globalState.getPluginPrivateKey(pkg.name);
    const api = new SmartlingApi(pluginPrivateKey);
    const { project } = await api.getProject();

    // assign locales to custom targeting attributes

    const currentLocales = appState.user.organization.value.customTargetingAttributes
      ?.get('locale')
      ?.toJSON();
    const smartlingLocales = project.targetLocales
      .filter(locale => locale.enabled)
      .map(locale => locale.localeId)
      .concat(project.sourceLocaleId);

    if (!isEqual(currentLocales?.enum, smartlingLocales)) {
      appState.user.organization.value.customTargetingAttributes.set('locale', {
        type: 'string',
        enum: smartlingLocales,
      });
    }

    // create a new action on content to add to job

    registerBulkAction({
      label: 'Translate',
      showIf(selectedContentIds, content, model) {
        const translationModel = getTranslationModel();
        if (model.name === translationModel.name) {
          return false;
        }

        const hasDraftOrTranslationPending = selectedContentIds.find(id => {
          const fullContent = content.find(entry => entry.id === id);
          return (
            fullContent.published !== 'published' ||
            ['pending', 'local'].includes(fullContent.meta?.get('translationStatus'))
          );
        });
        return appState.user.can('publish') && !hasDraftOrTranslationPending;
      },
      async onClick(actions, selectedContentIds, contentEntries) {
        let translationJobId = await pickTranslationJob();
        const selectedContent = selectedContentIds.map(id =>
          contentEntries.find(entry => entry.id === id)
        );
        if (translationJobId === null) {
          const name = await appState.dialogs.prompt({
            placeholderText: 'Enter a name for your new job',
          });
          if (name) {
            const localJob = await api.createLocalJob(name, selectedContent);
            translationJobId = localJob.id;
          }
        } else if (translationJobId) {
          // adding content to an already created job
          await api.updateLocalJob(translationJobId, selectedContent);
        }
        await Promise.all(
          selectedContent.map(entry =>
            appState.updateContent({
              id: entry.id,
              meta: {
                ...entry.meta,
                translationStatus: 'local',
                translationJobId,
              },
            })
          )
        );
        actions.refreshList();
      },
    });

    registerElementAction({
      label: 'exclude from future translation requests',
      showIf(element) {
        return element.component.name === 'Text';
      },
      onClick(element) {
        element.meta.set('excludeFromTranslation', true);
      },
    });

    registerContentAction({
      label: 'Add to translation job',
      showIf(content, model) {
        const translationModel = getTranslationModel();
        return model.name !== translationModel.name;
      },
      async onClick(content) {
        let translationJobId = await pickTranslationJob();
        console.log(' here t', translationJobId);
        if (translationJobId === null) {
          const name = await appState.dialogs.prompt({
            placeholderText: 'Enter a name for your new job',
          });
          if (name) {
            const localJob = await api.createLocalJob(name, [content]);
            translationJobId = localJob.id;
          }
        } else if (translationJobId) {
          // adding content to an already created job
          await api.updateLocalJob(translationJobId, [content]);
        }

        await appState.updateContent({
          id: content.id,
          meta: {
            ...content.meta,
            translationStatus: 'local',
            translationJobId,
          },
        });
        // todo add flag to content meta for translation job
      },
    });

    registerContentAction({
      label: 'Apply Translation',
      showIf(content, model) {
        const translationModel = getTranslationModel();
        return content.published === 'published' && model.name === translationModel.name;
      },
      async onClick(localTranslationJob) {
        const translationModel = getTranslationModel();
        appState.globalState.showGlobalBlockingLoading();
        await api.applyTranslation(localTranslationJob.id, translationModel.name);
        appState.globalState.hideGlobalBlockingLoading();
        appState.snackBar.show('Done!');
      },
    });

    return {};
  }
);

function pickTranslationJob() {
  const translationModel = getTranslationModel();
  return appState.globalState.showContentPickerDialog({
    message: 'Smartling Translation Jobs',
    modelId: translationModel.id,
    createNewMessage: 'Create',
    query: [
      {
        '@type': '@builder.io/core:Query',
        property: 'query.published',
        operator: 'is',
        value: 'draft',
      },
    ],
  });
}
