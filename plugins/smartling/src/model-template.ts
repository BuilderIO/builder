import appState from '@builder.io/app-context';

export const translationModelName = 'translation-job';

export function getTranslationModel() {
  return appState.models.result.find((m: any) => m.name === translationModelName);
}

export const getTranslationModelTemplate = (
  privateKey: string,
  apiKey: string,
  pluginId: string
) => ({
  '@version': 2,
  name: translationModelName,
  kind: 'data',
  subType: '',
  schema: {},
  publishText: 'Authorize',
  unPublishText: 'Cancel',
  fields: [
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
          helperText: 'The content to translate, must be published',
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
            if (contentModel.published === 'published') {
                return {
                    level: 'error',
                    message: 'Job was already sent to smartling, please duplicate to create a new job'
                }
            }
        } return run();`,
  },
  webhooks: [
    {
      customHeaders: [
        {
          name: 'Authorization',
          value: `Bearer ${privateKey}`,
        },
      ],
      // TODO apiRoot()
      url: `http://localhost:4000/api/v1/smartling/job-publish-hook?apiKey=${apiKey}&pluginId=${pluginId}`,
      disableProxy: true, // proxy has an issue with the POST request body
    },
  ],
  hideFromUI: false,
});
