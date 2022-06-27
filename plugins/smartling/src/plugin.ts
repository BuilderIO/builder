import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';
import appState from '@builder.io/app-context';
import isEqual from 'lodash/isEqual';
import { Builder } from '@builder.io/react';
import { getTranslationModelTemplate, translationModelName } from './model-template';

registerCommercePlugin(
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
    // fetch project
    // private key generate
    const pluginPrivateKey = await appState.globalState.getPluginPrivateKey(pkg.name);
    const api = new SmartlingApi(pluginPrivateKey);
    const { project } = await api.getProject();

    console.log(project, 'project');

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
        console.log(' here t', translationJobId);
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

class SmartlingApi {
  getBaseUrl(path: string, search = {}) {
    const params = new URLSearchParams({
      ...search,
      pluginId: pkg.name,
      apiKey: appState.user.apiKey,
    });

    const baseUrl = new URL(`http://localhost:4000/api/v1/smartling/${path}`);
    baseUrl.search = params.toString();
    return baseUrl.toString();
  }
  constructor(private privateKey: string) {}

  request(path: string, config?: RequestInit, search = {}) {
    return fetch(`${this.getBaseUrl(path, search)}`, {
      ...config,
      headers: {
        Authorization: `Bearer ${this.privateKey}`,
        'Content-Type': 'application/json',
      },
    }).then(res => res.json());
  }
  // todo separate types
  getProject(): Promise<{
    project: {
      targetLocales: Array<{ enabled: boolean; localeId: string }>;
      sourceLocaleId: string;
    };
  }> {
    return this.request('project');
  }

  getJob(id: string): Promise<{ job: any }> {
    return this.request('job', { method: 'GET' }, { id });
  }

  createLocalJob(name: string, content: any[]): Promise<any> {
    const translationModel = getTranslationModel();
    return appState.createContent(translationModel.name, {
      name,
      meta: {
        createdBy: pkg.name,
      },
      data: {
        entries: content.map(getContentReference),
      },
    });
  }
  async updateLocalJob(jobId: string, content: any[]) {
    const latestDraft = await appState.getLatestDraft(jobId);
    const draft = {
      ...latestDraft,
      data: {
        ...latestDraft.data,
        entries: [...(latestDraft.data.entries || []), ...content.map(c => getContentReference(c))],
      },
    };
    appState.updateLatestDraft(draft);
  }

  applyTranslation(id: string, model: string) {
    return this.request('apply-translation', {
      method: 'POST',
      body: JSON.stringify({
        id,
        model,
      }),
    });
  }
}

type BulkAction = {
  label: string;
  showIf(selectedContentIds: string[], content: any[], model: any): Boolean;
  onClick(
    actions: { refreshList: () => void },
    selectedContentIds: string[],
    content: any[],
    model: any
  ): Promise<void>;
};

function registerBulkAction(bulkAction: BulkAction) {
  Builder.register('content.bulkAction', bulkAction);
}

type ContentAction = {
  label: string;
  showIf(content: any, model: any): Boolean;
  onClick(content: any): Promise<void>;
};

function registerContentAction(contentAction: ContentAction) {
  Builder.register('content.action', contentAction);
}

type ElementAction = {
  label: string;
  showIf(element: any, model: any): Boolean;
  onClick(element: any): Promise<void> | void;
};

function registerElementAction(elementAction: ElementAction) {
  Builder.register('element.action', elementAction);
}

function getContentReference(content: any) {
  return {
    content: {
      '@type': '@builder.io/core:Reference',
      id: content.id,
      model: content.modelName,
    },
    preview: content.previewUrl,
  };
}

function getTranslationModel() {
  return appState.models.result.find((m: any) => m.name === translationModelName);
}

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
