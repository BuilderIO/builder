// Removed commerce plugin tools dependency
import pkg from '../package.json';
import appState from '@builder.io/app-context';
import uniq from 'lodash/uniq';
import isEqual from 'lodash/isEqual';
import {
  getTranslationModelTemplate,
  getTranslationModel,
  translationModelName,
} from './model-template';
import {
  registerBulkAction,
  registerContentAction,
  registerContextMenuAction,
  CustomReactEditorProps,
  fastClone,
  registerEditorOnLoad,
} from './plugin-helpers';
import { SmartlingConfigurationEditor } from './smartling-configuration-editor';
import { SmartlingApi, Project } from './smartling';
import { showJobNotification, showOutdatedNotifications } from './snackbar-utils';
import { Builder } from '@builder.io/react';
import React from 'react';
import { getTranslateableFields } from '@builder.io/utils';
import hash from 'object-hash';
import stringify from 'fast-json-stable-stringify';
// translation status that indicate the content is being queued for translations
const enabledTranslationStatuses = ['pending', 'local'];

// Cache for job existence checks to avoid repeated API calls
const jobExistenceCache = new Map<string, { exists: boolean; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// Helper function to check if content is actually in an active translation job
async function isContentInActiveTranslationJob(content: any, api: SmartlingApi): Promise<boolean> {
  const translationStatus = content.meta?.get('translationStatus');
  const translationJobId = content.meta?.get('translationJobId');
  
  // If no translation status or job ID, definitely not in active translation
  if (!enabledTranslationStatuses.includes(translationStatus) || !translationJobId) {
    return false;
  }
  
  // Check cache first
  const cached = jobExistenceCache.get(translationJobId);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    // If cached result shows job doesn't exist, clean up metadata
    if (!cached.exists) {
      // await api.cleanupOrphanedTranslationMetadata(content);
    }
    return cached.exists;
  }
  
  // Check if job actually exists
  const jobExists = await api.checkTranslationJobExists(translationJobId);
  
  // Update cache
  jobExistenceCache.set(translationJobId, { exists: jobExists, timestamp: now });
  
  // If job doesn't exist, clean up metadata
  if (!jobExists) {
    // await api.cleanupOrphanedTranslationMetadata(content);
    return false;
  }
  
  return true;
}

// Utility function to clear job existence cache (useful for testing/debugging)
function clearJobExistenceCache(): void {
  jobExistenceCache.clear();
}


function updatePublishCTA(content: any, translationModel: any) {
  let publishButtonText = undefined;
  let publishedToastMessage = undefined;

  // establish that it's a job's content entry that we are currently in
  if (content?.modelId === translationModel?.id) {
    const pluginSettings = appState.user.organization?.value?.settings?.plugins?.get(pkg.name);
    if (!pluginSettings) {
      return;
    }

    const enableJobAutoAuthorization = pluginSettings.get('enableJobAutoAuthorization');
    const isJobAlreadyPublished = content.published === 'published';
    const hasEntries = content.data?.get('entries')?.length > 0;


    // Check if the job has been sent to Smartling (status 'pending') - if so, disable CTA
    const hasEntriesWithPendingStatus = content.data?.get('entries')?.some((entry: any) => {
      return entry?.meta?.translationStatus === 'pending';
    });

    if (hasEntriesWithPendingStatus) {
      // Job has been sent to Smartling, disable the publish button
      publishButtonText = undefined;
      publishedToastMessage = undefined;
    } else {
      // Job is still local, allow publishing but remove "Update" language
      // if 'enableJobAutoAuthorization' is undefined then assume it to be true and proceed likewise
      if (enableJobAutoAuthorization === undefined || enableJobAutoAuthorization === true) {
        publishButtonText = 'Authorize';
        publishedToastMessage = 'Authorized';
      } else {
        publishButtonText = 'Send to Smartling';
        publishedToastMessage = 'Sent to Smartling';
      }

    }
  }

  appState.designerState.editorOptions.publishButtonText = publishButtonText;
  appState.designerState.editorOptions.publishedToastMessage = publishedToastMessage;
}

// Register the Smartling plugin
Builder.register('plugin', {
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
      type: 'password',
      required: true,
      hideFromUI: false,
    },
    {
      name: 'enableJobAutoAuthorization',
      friendlyName: 'Authorize Smartling Jobs through Builder',
      type: 'boolean',
      defaultValue: true,
      advanced: false,
      helperText: 'Allows users to authorize Smartling jobs directly from Builder',
      requiredPermissions: ['admin'],
    },
    {
      name: 'copySmartlingLocales',
      friendlyName: 'Copy Locales from Smartling to Builder',
      type: 'boolean',
      defaultValue: true,
      helperText: 'This will copy locales from Smartling to Builder',
      requiredPermissions: ['admin'],
    },
    {
      name: 'defaultProjectId',
      friendlyName: 'Default Smartling Project',
      type: 'SmartlingProject',
      helperText: 'Default project to use for new translation jobs',
      advanced: false,
      requiredPermissions: ['admin'],
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
  ctaText: `Save plugin settings`,
});

// Create API instance for plugin use
const api = new SmartlingApi();

// Initialize plugin functionality
const initializeSmartlingPlugin = async () => {
  // Wait for API to initialize - this should always happen
  await api.loaded;

  // Get plugin settings - but don't return early if they don't exist
  const pluginSettings = appState.user.organization?.value?.settings?.plugins?.get(pkg.name);
  
  // Ensure enableJobAutoAuthorization defaults to true if settings exist
  if (pluginSettings && pluginSettings.get('enableJobAutoAuthorization') === undefined) {
    pluginSettings.set('enableJobAutoAuthorization', true);
  }
  
  const settings = pluginSettings;
  const copySmartlingLocales = settings?.get('copySmartlingLocales');
  
  
  // Update model template and model exists
  const existingModel = getTranslationModel();
  if (existingModel) {
    const pluginPrivateKey = await appState.globalState.getPluginPrivateKey(pkg.name);
    const updatedTemplate = getTranslationModelTemplate(
      pluginPrivateKey, 
      appState.user.apiKey, 
      pkg.name
    );
    
    // Check if webhook URL needs updating
    const currentWebhookUrl = existingModel.webhooks?.[0]?.url;
    const newWebhookUrl = updatedTemplate.webhooks[0].url;
    
    if (currentWebhookUrl && !currentWebhookUrl.includes('preferredVersion=v2') && newWebhookUrl.includes('preferredVersion=v2')) {
      // Update the existing model with v2 webhook
      existingModel.webhooks = updatedTemplate.webhooks;
    }
  }
  
  registerEditorOnLoad(({ safeReaction }) => {
    
    safeReaction(
        () => {
          return String(appState.designerState.editingContentModel?.lastUpdated || '');
        },
        async shouldCheck => {
          if (!shouldCheck) {
            return;
          }

          updatePublishCTA(appState.designerState.editingContentModel, getTranslationModel());

          const translationStatus = appState.designerState.editingContentModel.meta.get(
            'translationStatus'
          );
          const translationRequested = appState.designerState.editingContentModel.meta.get(
            'translationRequested'
          );

          // check if there's pending translation
          const isFresh =
            appState.designerState.editingContentModel.lastUpdated > new Date(translationRequested);
          if (!isFresh) {
            return;
          }
          const content = fastClone(appState.designerState.editingContentModel);
          const isPending = translationStatus === 'pending';
          const projectId = content.meta?.translationBatch?.projectId;
          if (isPending && projectId && content.published === 'published') {
            const lastPublishedContent = await fetch(
              `https://cdn.builder.io/api/v3/content/${appState.designerState.editingModel.name}/${content.id}?apiKey=${appState.user.apiKey}&cachebust=true`
            ).then(res => res.json());
            const res = await api.getProject(projectId);
            const sourceLocale = res.project?.sourceLocaleId;
            const translatableFields = getTranslateableFields(
              lastPublishedContent,
              sourceLocale,
              ''
            );
            const currentRevision = hash(stringify(translatableFields), {
              encoding: 'base64',
            });
            appState.designerState.editingContentModel.meta.set(
              'translationRevisionLatest',
              currentRevision
            );
            if (currentRevision !== content.meta.translationRevision) {
              showOutdatedNotifications(async () => {
                appState.globalState.showGlobalBlockingLoading('Contacting Smartling ....');
                await api.updateTranslationFile({
                  translationJobId: lastPublishedContent.meta.translationJobId,
                  translationModel: translationModelName,
                  contentId: lastPublishedContent.id,
                  contentModel: appState.designerState.editingModel.name,
                  preview: lastPublishedContent.meta.lastPreviewUrl,
                });
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

      let combinedLocales = [...new Set([...smartlingLocales, ...currentLocales?.enum || []])];

      
        if (copySmartlingLocales) {
          //merge builder locales with smartling locales (all unique locales)
          if(!isEqual(currentLocales?.enum, combinedLocales)){
            appState.user.organization.value.customTargetingAttributes?.get('locale').set('enum', combinedLocales);
          }
        }
    });
    // create a new action on content to add to job
    registerBulkAction({
      label: 'Translate',
      showIf(selectedContentIds, content, model) {
        const translationModel = getTranslationModel();
        if (!model || !translationModel || model.name === translationModel.name) {
          return false;
        }

        const hasActiveTranslationPending = selectedContentIds.find(id => {
          const fullContent = content.find(entry => entry.id === id);
          const translationStatus = fullContent.meta?.get('translationStatus');
          const translationJobId = fullContent.meta?.get('translationJobId');
          const translationRevision = fullContent.meta?.get('translationRevision');
          const translationRevisionLatest = fullContent.meta?.get('translationRevisionLatest');
          
          // If content has translation status but no job ID, it's orphaned - allow action
          if (enabledTranslationStatuses.includes(translationStatus) && !translationJobId) {
            return false; // Not pending (orphaned)
          }
          
          // If content has changes (different revisions), allow re-translation
          if (translationRevision && translationRevisionLatest && translationRevision !== translationRevisionLatest) {
            return false; // Has changes, allow action
          }
          
          // If content has active translation status and is currently being edited with unsaved changes, allow action
          if (enabledTranslationStatuses.includes(translationStatus) && 
              appState.designerState.editingContentModel?.id === fullContent.id && 
              appState.designerState.hasUnsavedChanges()) {
            return false; // Has unsaved changes in currently edited content, allow action
          }
          
          // If content has both status and job ID, check cache
          if (enabledTranslationStatuses.includes(translationStatus) && translationJobId) {
            // Trigger background validation for each item
            isContentInActiveTranslationJob(fullContent, api).catch(() => {});
            
            // Check cache
            const cached = jobExistenceCache.get(translationJobId);
            if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
              return cached.exists; // Return whether job exists
            }
            
            // Default to pending while validating
            return true;
          }
          
          return false; // No translation status
        });
        return appState.user.can('publish') && !hasActiveTranslationPending;
      },
      async onClick(actions, selectedContentIds, contentEntries) {
        let translationJobId = await pickTranslationJob();
        const selectedContent = selectedContentIds.map(id =>
          contentEntries.find(entry => entry.id === id)
        );
        
        const filteredContent = selectedContent.filter(content => content);
        if (translationJobId === null) {
          const name = await appState.dialogs.prompt({
            placeholderText: 'Enter a name for your new job',
          });
          if (name) {
            // Use enhanced job creation that supports both v1 and v2
            const localJob = await api.createTranslationJob(name, filteredContent);
            translationJobId = localJob.id;
          }
        } else if (translationJobId) {
          // adding content to an already created job
          await api.updateBatchTranslation(translationJobId, filteredContent);
          
          // For changed content that was previously published, update translation files in Smartling
          const changedPublishedContent = filteredContent.filter(entry => {
            const translationRevision = entry.meta?.get('translationRevision');
            const translationRevisionLatest = entry.meta?.get('translationRevisionLatest');
            return entry.published === 'published' && 
                   translationRevision && translationRevisionLatest && 
                   translationRevision !== translationRevisionLatest;
          });
          
          if (changedPublishedContent.length > 0) {
            await Promise.all(changedPublishedContent.map(async (entry) => {
              try {
                await api.updateTranslationFile({
                  translationJobId,
                  translationModel: getTranslationModel().name,
                  contentId: entry.id,
                  contentModel: appState.designerState.editingModel?.name || 'page',
                  preview: entry.meta?.get?.('lastPreviewUrl') || entry.meta?.lastPreviewUrl,
                });
              } catch (error) {
              }
            }));
          }
        }
        await Promise.all(
          filteredContent.map(entry => {
            const metaUpdates: any = {
              ...fastClone(entry.meta),
              translationStatus: 'local',
              translationJobId,
            };
            
            // If content has changes (different revisions), update revision to latest
            const translationRevision = entry.meta?.get('translationRevision');
            const translationRevisionLatest = entry.meta?.get('translationRevisionLatest');
            if (translationRevision && translationRevisionLatest && translationRevision !== translationRevisionLatest) {
              metaUpdates.translationRevision = translationRevisionLatest;
            }
            
            return appState.updateLatestDraft({
              id: entry.id,
              modelId: entry.modelId,
              meta: metaUpdates,
            });
          })
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
        // Always show the action - we'll handle unconfigured state in onClick
        if (!translationModel) return true;
        
        const translationStatus = content.meta?.get('translationStatus');
        const translationJobId = content.meta?.get('translationJobId');
        const translationRevision = content.meta?.get('translationRevision');
        const translationRevisionLatest = content.meta?.get('translationRevisionLatest');
        
        // Allow adding if:
        // 1. Content is not in a translation model
        // 2. AND content is not currently in an active translation job OR has changes
        if (model?.name === translationModel.name) {
          return false;
        }
        
        // If content has translation status but no job ID, allow adding (orphaned status)
        if (enabledTranslationStatuses.includes(translationStatus) && !translationJobId) {
          return true;
        }
        
        // If content has changes (different revisions), allow re-translation
        if (translationRevision && translationRevisionLatest && translationRevision !== translationRevisionLatest) {
          return true;
        }
        
        // If content has active translation status and is currently being edited with unsaved changes, allow re-translation
        if (enabledTranslationStatuses.includes(translationStatus) && 
            appState.designerState.editingContentModel?.id === content.id && 
            appState.designerState.hasUnsavedChanges()) {
          return true;
        }
        
        // If content has both status and job ID, validate job existence in background
        if (enabledTranslationStatuses.includes(translationStatus) && translationJobId) {
          // Trigger background validation and cleanup if needed
          isContentInActiveTranslationJob(content, api).catch(() => {});
          
          // Check cache for immediate result
          const cached = jobExistenceCache.get(translationJobId);
          if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            return !cached.exists; // Allow adding if job doesn't exist
          }
          
          // Default to hiding the action while we validate
          return false;
        }
        
        // Content has no translation status, allow adding
        return true;
      },
      async onClick(content) {
        const translationModel = getTranslationModel();
        if (!translationModel) {
          appState.snackBar.show('Please configure the Smartling plugin in the plugins section first.');
          return;
        }
        
        // If there are unsaved changes, wait for auto-save to complete
        if (appState.designerState.hasUnsavedChanges()) {
          // Give a moment for auto-save to complete and update metadata
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        
        let translationJobId = await pickTranslationJob();
        if (translationJobId === null) {
          const name = await appState.dialogs.prompt({
            placeholderText: 'Enter a name for your new job',
          });
          if (name) {
            // Use enhanced job creation that supports both v1 and v2
            const localJob = await api.createTranslationJob(name, [content]);
            translationJobId = localJob.id;
          }
        } else if (translationJobId) {
          // adding content to an already created job
          await api.updateBatchTranslation(translationJobId, [content]);
          
          // For changed content that was previously published, update translation file in Smartling
          const translationRevision = content.meta?.get('translationRevision');
          const translationRevisionLatest = content.meta?.get('translationRevisionLatest');
          const isChangedPublishedContent = content.published === 'published' && 
                                           translationRevision && translationRevisionLatest && 
                                           translationRevision !== translationRevisionLatest;
          
          if (isChangedPublishedContent) {
            try {
              await api.updateTranslationFile({
                translationJobId,
                translationModel: getTranslationModel().name,
                contentId: content.id,
                contentModel: appState.designerState.editingModel?.name || 'page',
                preview: content.meta?.get?.('lastPreviewUrl') || content.meta?.lastPreviewUrl,
              });
            } catch (error) {
            }
          }
        }

        const metaUpdates: any = {
          ...fastClone(content.meta),
          translationStatus: 'local',
          translationJobId,
          translationBy: pkg.name,
        };
        
        // If content has changes (different revisions), update revision to latest
        const translationRevision = content.meta?.get('translationRevision');
        const translationRevisionLatest = content.meta?.get('translationRevisionLatest');
        if (translationRevision && translationRevisionLatest && translationRevision !== translationRevisionLatest) {
          metaUpdates.translationRevision = translationRevisionLatest;
        }
        
        await appState.updateLatestDraft({
          id: content.id,
          modelId: content.modelId,
          meta: metaUpdates,
        });
        showJobNotification(translationJobId);
      },
      isDisabled() {
        return false; // Allow action even with unsaved changes for re-translation scenarios
      },
      disabledTooltip: 'Will save changes automatically before adding to translation job',
    });
    registerContentAction({
      label: 'Request an updated translation',
      showIf(content, model) {
        // Disabled: Users cannot currently update existing translation jobs
        return false;
      },
      async onClick(content) {
        appState.globalState.showGlobalBlockingLoading('Contacting Smartling ....');
        const lastPublishedContent = await fetch(
          `https://cdn.builder.io/api/v3/content/${appState.designerState.editingModel.name}/${content.id}?apiKey=${appState.user.apiKey}&cachebust=true`
        ).then(res => res.json());
        await api.updateTranslationFile({
          translationJobId: lastPublishedContent.meta.translationJobId,
          translationModel: getTranslationModel().name,
          contentId: lastPublishedContent.id,
          contentModel: appState.designerState.editingModel.name,
          preview: lastPublishedContent.meta.lastPreviewUrl,
        });
        appState.globalState.hideGlobalBlockingLoading();
      },
    });
    registerContentAction({
      label: 'Apply Translation',
      showIf(content, model) {
        const translationModel = getTranslationModel();
        if (!translationModel) return false;
        return content.published === 'published' && model?.name === translationModel.name;
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
      label: 'View translation job',
      showIf(content, model) {
        const translationModel = getTranslationModel();
        
        if (!translationModel) {
          return false;
        }
        
        const translationJobId = content.meta?.get('translationJobId');
        
        if (model?.name === translationModel.name) {
          return false;
        }
        
        // Show if content has a translation job ID (regardless of status)
        if (!translationJobId) {
          return false;
        }
        
        
        // Trigger background validation and cleanup if needed
        isContentInActiveTranslationJob(content, api).catch(() => {});
        
        // Check cache for immediate result
        const cached = jobExistenceCache.get(translationJobId);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
          return cached.exists; // Show only if job exists
        }
        
        // Default to showing while we validate (will hide after background check completes)
        return true;
      },
      async onClick(content) {
        const translationJobId = content.meta.get('translationJobId');
        const translationModel = getTranslationModel();
        
        if (translationJobId && translationModel) {
          // Navigate to the specific translation job in Builder
          appState.location.go(`/content/${translationModel.name}/${translationJobId}`);
        } else {
          appState.snackBar.show('Translation job not found');
        }
      },
    });

    registerContentAction({
      label: 'View translation strings in smartling',
      showIf(content, model) {
        const translationModel = getTranslationModel();
        if (!translationModel) return false;
        return (
          model?.name !== translationModel.name &&
          content.meta?.get('translationStatus') === 'pending'
        );
      },
      async onClick(content) {
        const translationBatch = fastClone(content.meta).translationBatch;
        // https://dashboard.smartling.com/app/projects/0e6193784/strings/jobs/schqxtpcnxix
        const smartlingFile = `https://dashboard.smartling.com/app/projects/${translationBatch.projectId}/strings/jobs/${translationBatch.translationJobUid}`;
        window.open(smartlingFile, '_blank', 'noreferrer,noopener');
      },
    });

    registerContentAction({
      label: 'Clear translation metadata',
      showIf(content, model) {
        const translationModel = getTranslationModel();
        if (!translationModel) return false;
        const translationStatus = content.meta?.get('translationStatus');
        const translationJobId = content.meta?.get('translationJobId');
        // Show for content that has translation metadata but is not actively being translated
        return (
          model?.name !== translationModel.name &&
          (translationJobId || translationStatus) &&
          !enabledTranslationStatuses.includes(translationStatus)
        );
      },
      async onClick(content) {
        const result = await appState.dialogs.confirm({
          message: 'This will clear all translation metadata from this content. Are you sure?',
        });
        if (result) {
          const updatedMeta = fastClone(content.meta);
          delete updatedMeta.translationStatus;
          delete updatedMeta.translationJobId;
          delete updatedMeta.translationBy;
          delete updatedMeta.translationRevision;
          delete updatedMeta.translationRevisionLatest;
          delete updatedMeta.translationBatch;
          delete updatedMeta.translationRequested;
          
          await appState.updateLatestDraft({
            id: content.id,
            modelId: content.modelId,
            meta: updatedMeta,
          });
          appState.snackBar.show('Translation metadata cleared.');
        }
      },
    });

    registerContentAction({
      label: 'Remove from translation job',
      showIf(content, model) {
        const translationModel = getTranslationModel();
        if (!translationModel) return false;
        
        const translationStatus = content.meta?.get('translationStatus');
        const translationJobId = content.meta?.get('translationJobId');
        
        if (model?.name === translationModel.name) {
          return false;
        }
        
        // Only show if content has both job ID and active status
        if (!translationJobId || !enabledTranslationStatuses.includes(translationStatus)) {
          return false;
        }
        
        // Trigger background validation and cleanup if needed
        isContentInActiveTranslationJob(content, api).catch(() => {});
        
        // Check cache for immediate result
        const cached = jobExistenceCache.get(translationJobId);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
          return cached.exists; // Show only if job exists
        }
        
        // Default to showing while we validate
        return true;
      },
      async onClick(content) {
        appState.globalState.showGlobalBlockingLoading();

        await api.removeContentFromTranslationJob({
          contentId: content.id,
          contentModel: appState.designerState.editingModel.name,
          translationJobId: content.meta.get('translationJobId'),
          translationModel: translationModelName,
        });

        appState.globalState.hideGlobalBlockingLoading();
        appState.snackBar.show('Removed from translation job.');
      },
    });

    Builder.registerEditor({
      name: 'SmartlingConfiguration',
      component: (props: CustomReactEditorProps) => {
        return <SmartlingConfigurationEditor {...props} api={api} />;
      },
    });

};


// Register SmartlingProject editor for project selection - must be outside async init
Builder.registerEditor({
  name: 'SmartlingProject',
  component: (props: any) => {
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
      const loadProjects = async () => {
        setLoading(true);
        try {
          const response = await api.getAllProjects();
          const projectsWithDetails = [];
          for (const proj of response.results) {
            const details = await api.getProject(proj.projectId);
            projectsWithDetails.push(details.project);
          }
          setProjects(projectsWithDetails);
        } catch (error) {
          // If we can't load projects, set an empty array so the select still renders
          setProjects([]);
        }
        setLoading(false);
      };
      loadProjects();
    }, []);

    return React.createElement(
      React.Fragment,
      {},
      loading 
        ? React.createElement(
            'div',
            { style: { textAlign: 'center' } },
            React.createElement('span', {}, 'Loading projects...')
          )
        : React.createElement(
            'select',
            {
              value: props.value || '',
              onChange: (e: any) => props.onChange(e.target.value),
              disabled: loading,
              style: {
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }
            },
            [
              React.createElement('option', { key: '', value: '' }, 'Select a project...'),
              ...projects.map(project =>
                React.createElement('option', {
                  key: project.projectId,
                  value: project.projectId
                }, project.projectName)
              )
            ]
          )
    );
  },
});

// Initialize the plugin when settings are available
Builder.nextTick(() => {
  initializeSmartlingPlugin();
});

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
      {
        '@type': '@builder.io/core:Query',
        property: 'query.published',
        operator: 'is', 
        value: 'published',
      },
    ],
  });
}

// Removed transformProject function - no longer needed with Builder.register pattern

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
