import appState from '@builder.io/app-context';

export const translationModelName = 'translation-job';

export function getTranslationModel() {
  return appState.models.result.find((m: any) => m.name === translationModelName);
}

export const getTranslationModelTemplate = (
  privateKey: string,
  apiKey: string,
  pluginId: string,
  apiVersion: 'v1' | 'v2' = 'v1'
) => {
  // Get the default project from plugin settings
  const pluginSettings = appState.user.organization?.value?.settings?.plugins?.get(pluginId);
  const defaultProjectId = pluginSettings?.get('defaultProjectId') || '';
  
  return {
  '@version': 3,
  name: translationModelName,
  kind: 'data',
  subType: '',
  schema: {},
  publishText: 'Authorize',
  unPublishText: 'Cancel',
  fields: [
    {
      '@type': '@builder.io/core:Field',
      name: 'description',
      type: 'text',
      required: false,
      helperText: 'Smartling job description',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'entries',
      type: 'list',
      required: false,
      subFields: [
        {
          '@type': '@builder.io/core:Field',
          name: 'instructions',
          type: 'text',
          required: false,
          subFields: [],
          helperText: '',
          autoFocus: false,
          simpleTextOnly: false,
          disallowRemove: false,
          broadcast: false,
          bubble: false,
          hideFromUI: false,
          hideFromFieldsEditor: false,
          showTemplatePicker: true,
          permissionsRequiredToEdit: '',
          advanced: false,
          copyOnAdd: false,
          onChange: '',
          showIf: '',
          mandatory: false,
          hidden: false,
          noPhotoPicker: false,
          model: '',
        },
        {
          '@type': '@builder.io/core:Field',
          name: 'preview',
          type: 'url',
          required: false,
          subFields: [],
          helperText: '',
          autoFocus: false,
          simpleTextOnly: false,
          disallowRemove: false,
          broadcast: false,
          bubble: false,
          hideFromUI: false,
          hideFromFieldsEditor: false,
          showTemplatePicker: true,
          permissionsRequiredToEdit: '',
          advanced: false,
          copyOnAdd: false,
          onChange: '',
          showIf: '',
          mandatory: false,
          hidden: false,
          noPhotoPicker: false,
          model: '',
        },
        {
          '@type': '@builder.io/core:Field',
          name: 'content',
          type: 'reference',
          defaultValue: {
            '@type': '@builder.io/core:Reference',
            id: '',
            model: '',
          },
          required: true,
          subFields: [],
          helperText: 'The content to translate must be in draft or published status.',
          autoFocus: false,
          simpleTextOnly: false,
          disallowRemove: false,
          broadcast: false,
          bubble: false,
          hideFromUI: false,
          hideFromFieldsEditor: false,
          showTemplatePicker: true,
          permissionsRequiredToEdit: '',
          advanced: false,
          copyOnAdd: false,
          onChange: '',
          showIf: '',
          mandatory: false,
          hidden: false,
          noPhotoPicker: false,
          model: '',
        },
      ],
      helperText: '',
      autoFocus: false,
      simpleTextOnly: false,
      disallowRemove: false,
      broadcast: false,
      bubble: false,
      hideFromUI: false,
      hideFromFieldsEditor: false,
      showTemplatePicker: true,
      permissionsRequiredToEdit: '',
      advanced: false,
      copyOnAdd: false,
      onChange: '',
      showIf: '',
      mandatory: false,
      hidden: false,
      noPhotoPicker: false,
      model: '',
    },
    {
      '@type': '@builder.io/core:Field',
      name: 'jobDetails',
      type: 'SmartlingConfiguration',
      defaultValue: {
        project: defaultProjectId,
        targetLocales: [],
      },
      required: true,
      subFields: [],
      helperText: '',
      autoFocus: false,
      simpleTextOnly: false,
      disallowRemove: false,
      broadcast: false,
      bubble: false,
      hideFromUI: false,
      hideFromFieldsEditor: false,
      showTemplatePicker: true,
      permissionsRequiredToEdit: '',
      advanced: false,
      copyOnAdd: true,
      onChange: '',
      showIf: '',
      mandatory: false,
      hidden: false,
      noPhotoPicker: false,
      model: '',
    },
  ],
  helperText: 'Smartling Translation Jobs',
  publicWritable: false,
  publicReadable: false,
  strictPrivateRead: true,
  strictPrivateWrite: true,
  showMetrics: false,
  showAbTests: false,
  showTargeting: false,
  showScheduling: false,
  hooks: {
    validate: `async function run() {
      // The API now handles both new jobs and updates to existing jobs
      // No need to block republishing - let the API decide what to do
      
      if (!contentModel.data.get('jobDetails')?.get('project')) {
        return {
            level: 'error',
            message: 'Please choose a smartling project for this job'
        }
      }
      if (!contentModel.data.get('jobDetails')?.get('targetLocales')?.length) {
        return {
            level: 'error',
            message: 'Please choose at least one target locale for this job'
        }
      }
      const entries = contentModel.data.get('entries') || [];
      const isJobAlreadyPublished = contentModel.published === 'published';
      
      // For published jobs (updates), be more permissive - just check that we have entries
      // For new jobs, validate that all entries have proper content references
      if (isJobAlreadyPublished) {
        // For published jobs, just ensure there are entries (allows for updates)
        if (entries.length === 0) {
          return {
              level: 'error',
              message: 'Please add content to this job'
          }
        }
      } else {
        // For new jobs, validate all entries have proper content references
        const validEntries = entries.length > 0 && entries.every(entry => entry.get('content')?.id);
        if (!validEntries) {
            return {
                level: 'error',
                message: 'Please add content to this job'
            }
        }
      }
  }
  return run();`,
  },
  webhooks: [
    {
      customHeaders: [
        {
          name: 'Authorization',
          value: `Bearer ${privateKey}`,
        },
      ],
      url: `${appState.config.apiRoot()}/api/v1/smartling/job-publish-hook?apiKey=${apiKey}&pluginId=${pluginId}&preferredVersion=${apiVersion}`,
      disableProxy: true, // proxy has an issue with the POST request body
    },
  ],
  hideFromUI: false,
};
}
