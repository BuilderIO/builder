import { registerCommercePlugin as registerPlugin } from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';
import appState from '@builder.io/app-context';
import {
  registerContentAction,
  registerContextMenuAction,
  fastClone,
  registerEditorOnLoad,
} from './plugin-helpers';
import { Phrase, Project } from './phrase';
import { showJobNotification, showOutdatedNotifications, getLangPicks } from './snackbar-utils';
import { getTranslateableFields } from '@builder.io/utils';
import hash from 'object-hash';
import stringify from 'fast-json-stable-stringify';
// translation status that indicate the content is being queued for translations
const enabledTranslationStatuses = ['pending', 'local'];

registerPlugin(
  {
    name: 'Phrase',
    id: pkg.name,
    settings: [
      {
        name: 'userName',
        type: 'string',
        required: true,
      },
      {
        name: 'password',
        type: 'password',
        required: true,
      },
      // allow developer to override callback host , e.g ngrok for local development
      ...(appState.user.isBuilderAdmin
        ? [
            {
              name: 'callbackHost',
              type: 'string',
            },
            {
              name: 'apiHost',
              type: 'string',
            },
          ]
        : []),
    ],
    ctaText: `Connect your Phrase account`,
    noPreviewTypes: true,
  },
  async settings => {
    const api = new Phrase(settings.get('apiHost'));
    registerEditorOnLoad(({ safeReaction }) => {
      safeReaction(
        () => {
          return String(appState.designerState.editingContentModel?.lastUpdated || '');
        },
        async shoudlCheck => {
          if (!shoudlCheck) {
            return;
          }
          const translationStatus =
            appState.designerState.editingContentModel.meta.get('translationStatus');
          const translationRequested =
            appState.designerState.editingContentModel.meta.get('translationRequested');

          // check if there's pending translation
          const isFresh =
            appState.designerState.editingContentModel.lastUpdated > new Date(translationRequested);
          if (!isFresh) {
            return;
          }
          const content = fastClone(appState.designerState.editingContentModel);
          const isPending = translationStatus === 'pending';
          const sourceLocale = content.meta?.translationSourceLang;
          if (isPending && sourceLocale && content.published === 'published') {
            const lastPublishedContent = await fetch(
              `https://cdn.builder.io/api/v3/content/${appState.designerState.editingModel.name}/${content.id}?apiKey=${appState.user.apiKey}&cachebust=true`
            ).then(res => res.json());
            const translatableFields = getTranslateableFields(
              lastPublishedContent,
              sourceLocale,
              ''
            );
            const currentRevision = hash(stringify(translatableFields), { encoding: 'base64' });
            appState.designerState.editingContentModel.meta.set(
              'translationRevisionLatest',
              currentRevision
            );
            if (currentRevision !== content.meta.translationRevision) {
              showOutdatedNotifications(async () => {
                appState.globalState.showGlobalBlockingLoading('Contacting Phrase ....');
                // TODO maybe just delete old project and re-request a new one.
                appState.globalState.hideGlobalBlockingLoading();
              });
            }
          }
        },
        {
          fireImmediately: true,
        }
      );
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
      label: 'Translate',
      showIf(content, model) {
        return (
          content.published === 'published' &&
          !enabledTranslationStatuses.includes(content.meta?.get('translationStatus'))
        );
      },
      async onClick(content) {
        const model = content.modelName;
        const contentId = content.id;
        const picks = await getLangPicks();
        if (picks) {
          appState.globalState.showGlobalBlockingLoading('Contacting Phrase ....');
          const { project } = await api.createJob(
            contentId,
            model,
            picks.sourceLang,
            picks.targetLangs,
            settings.get('callbackHost')
          );
          appState.globalState.hideGlobalBlockingLoading();
          showJobNotification(project.uid);
        }
      },
    });
    registerContentAction({
      label: 'Request an updated translation',
      showIf(content, model) {
        return (
          content.published === 'published' &&
          content.meta?.get('translationStatus') === 'pending' &&
          content.meta.get('translationRevisionLatest') &&
          content.meta.get('translationRevision') !== content.meta.get('translationRevisionLatest')
        );
      },
      async onClick(content) {
        appState.globalState.showGlobalBlockingLoading('Contacting Phrase ....');
        // TODO
        appState.globalState.hideGlobalBlockingLoading();
      },
    });

    registerContentAction({
      label: 'Apply Translation',
      showIf(content, model) {
        return (
          content.published === 'published' && content.meta.get('translationStatus') === 'pending'
        );
      },
      async onClick(content) {
        appState.globalState.showGlobalBlockingLoading();
        const file = await api.applyTranslation(content.id, content.modelName);
        appState.globalState.hideGlobalBlockingLoading();
        appState.snackBar.show('Done!');
      },
    });

    registerContentAction({
      label: 'Reset Translation',
      showIf(content, model) {
        return (
          content.published === 'published' && content.meta.get('translationStatus') === 'pending'
        );
      },
      async onClick(content) {
        appState.globalState.showGlobalBlockingLoading();
        const contentMeta = fastClone(content).meta;
        for (const key in contentMeta) {
          if (key.startsWith('translation')) {
            content.meta.delete(key);
          }
        }
        appState.globalState.hideGlobalBlockingLoading();
        appState.snackBar.show('Done!');
      },
    });

    return {};
  }
);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
