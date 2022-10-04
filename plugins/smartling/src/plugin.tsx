import {
  registerCommercePlugin as registerPlugin,
  Resource,
} from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';
import appState from '@builder.io/app-context';
import uniq from 'lodash/uniq';
import isEqual from 'lodash/isEqual';
import { getTranslationModelTemplate, getTranslationModel } from './model-template';
import {
  registerBulkAction,
  registerContentAction,
  registerContextMenuAction,
  CustomReactEditorProps,
  fastClone,
} from './plugin-helpers';
import { SmartlingConfigurationEditor } from './smartling-configuration-editor';
import { SmartlingApi, Project } from './smartling';
import { showJobNotification } from './snackbar-utils';
import { Builder } from '@builder.io/react';
import React from 'react';
// translation status that indicate the content is being queued for translations
const enabledTranslationStatuses = ['pending', 'local'];

registerPlugin(
  {
    name: 'Smartling',
    id: pkg.name,
    settings: [
      {
        name: 'accountUid',
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
    ctaText: `Connect your Smartling account`,
    noPreviewTypes: true,
  },
  async () => {
    const pluginPrivateKey = await appState.globalState.getPluginPrivateKey(pkg.name);
    const api = new SmartlingApi(pluginPrivateKey);

    // assign locales to custom targeting attributes
    Builder.nextTick(async () => {
      const projectResponse = await api.getAllProjects();
      let allProjectsWithLocales: Project[] = [];
      for (let index = 0; index < projectResponse.results.length; index++) {
        // avoid exceeding rate limit of 5 requests per second from smartling
        if (index % 5 === 0) {
          await delay(1000);
        }
        allProjectsWithLocales.push(
          await api.getProject(projectResponse.results[index].projectId).then(res => res.project)
        );
      }
      const smartlingLocales = uniq(
        allProjectsWithLocales
          .map(project =>
            project.targetLocales
              .filter(locale => locale.enabled)
              .map(locale => locale.localeId)
              .concat(project.sourceLocaleId)
          )
          .reduce((acc, val) => acc.concat(val), [])
      );

      const currentLocales = appState.user.organization.value.customTargetingAttributes
        ?.get('locale')
        ?.toJSON();

      if (!isEqual(currentLocales?.enum, smartlingLocales)) {
        appState.user.organization.value.customTargetingAttributes.set('locale', {
          type: 'string',
          enum: smartlingLocales,
        });
      }
    });
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
            enabledTranslationStatuses.includes(fullContent.meta?.get('translationStatus'))
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
            appState.updateLatestDraft({
              id: entry.id,
              modelId: entry.modelId,
              meta: {
                ...fastClone(entry.meta),
                translationStatus: 'local',
                translationJobId,
              },
            })
          )
        );
        actions.refreshList();
        showJobNotification(translationJobId);
      },
    });
    const transcludedMetaKey = 'excludeFromTranslation';
    registerContextMenuAction({
      label: 'Exclude from future translations',
      showIf(selectedElements) {
        if (selectedElements.length !== 1) {
          // todo maybe apply for multiple
          return false;
        }
        const element = selectedElements[0];
        const isExcluded = element.meta?.get(transcludedMetaKey);
        return element.component?.name === 'Text' && !isExcluded;
      },
      onClick(elements) {
        elements.forEach(el => el.meta.set('excludeFromTranslation', true));
      },
    });

    registerContextMenuAction({
      label: 'Include in future translations',
      showIf(selectedElements) {
        if (selectedElements.length !== 1) {
          // todo maybe apply for multiple
          return false;
        }
        const element = selectedElements[0];
        const isExcluded = element.meta?.get(transcludedMetaKey);
        return element.component?.name === 'Text' && isExcluded;
      },
      onClick(elements) {
        elements.forEach(el => el.meta.set('excludeFromTranslation', false));
      },
    });

    registerContentAction({
      label: 'Add to translation job',
      showIf(content, model) {
        const translationModel = getTranslationModel();
        return (
          content.published === 'published' &&
          model.name !== translationModel.name &&
          !enabledTranslationStatuses.includes(content.meta?.get('translationStatus'))
        );
      },
      async onClick(content) {
        let translationJobId = await pickTranslationJob();
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

        await appState.updateLatestDraft({
          id: content.id,
          modelId: content.modelId,
          meta: {
            ...fastClone(content.meta),
            translationStatus: 'local',
            translationJobId,
          },
        });
        showJobNotification(translationJobId);
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

    registerContentAction({
      label: 'View pending translation job',
      showIf(content, model) {
        const translationModel = getTranslationModel();
        return (
          content.published === 'published' &&
          model.name !== translationModel.name &&
          enabledTranslationStatuses.includes(content.meta?.get('translationStatus'))
        );
      },
      async onClick(content) {
        appState.location.go(`/content/${content.meta.get(`translationJobId`)}`);
      },
    });

    Builder.registerEditor({
      name: 'SmartlingConfiguration',
      component: (props: CustomReactEditorProps) => (
        <SmartlingConfigurationEditor {...props} api={api} />
      ),
    });

    return {
      project: {
        findById(id: string) {
          return api.getProject(id).then(res => transformProject(res.project));
        },
        search(q = '') {
          return api
            .getAllProjects()
            .then(res =>
              res.results
                .filter(proj => proj.projectName.toLowerCase().includes(q.toLowerCase()))
                .map(transformProject)
            );
        },
        getRequestObject(id) {
          // todo update types, commerce-plugin-tools actually accepts strings, just needs an interface update
          return id as any;
        },
      },
    };
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

const transformProject = (project: Project): Resource => {
  return {
    id: project.projectId,
    title: project.projectName,
  };
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
