import type { ComponentInfo } from '../../types/components';

export const componentInfo: ComponentInfo = {
  name: 'Form:Form',

  // editableTags: ['builder-form-error']
  defaults: {
    responsiveStyles: {
      large: {
        marginTop: '15px',
        paddingBottom: '15px',
      },
    },
  },
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2Fef36d2a846134910b64b88e6d18c5ca5',
  inputs: [
    {
      name: 'sendSubmissionsTo',
      type: 'string',
      // TODO: save to builder data and user can download as csv
      // TODO: easy for mode too or computed add/remove fields form mode
      // so you can edit details and high level mode at same time...
      // Later - more integrations like mailchimp
      // /api/v1/form-submit?to=mailchimp
      enum: [
        {
          label: 'Send to email',
          value: 'email',
          helperText:
            'Send form submissions to the email address of your choosing',
        },
        {
          label: 'Custom',
          value: 'custom',
          helperText:
            'Handle where the form requests go manually with a little code, e.g. to your own custom backend',
        },
      ],
      defaultValue: 'email',
    },
    {
      name: 'sendSubmissionsToEmail',
      type: 'string',
      required: true, // TODO: required: () => options.get("sendSubmissionsTo") === "email"
      defaultValue: 'your@email.com',
      showIf: 'options.get("sendSubmissionsTo") === "email"',
    },
    {
      name: 'sendWithJs',
      type: 'boolean',
      helperText: 'Set to false to use basic html form action',
      defaultValue: true,
      showIf: 'options.get("sendSubmissionsTo") === "custom"',
    },
    {
      name: 'name',
      type: 'string',
      defaultValue: 'My form',
      // advanced: true
    },
    {
      name: 'action',
      type: 'string',
      helperText: 'URL to send the form data to',
      showIf: 'options.get("sendSubmissionsTo") === "custom"',
    },
    {
      name: 'contentType',
      type: 'string',
      defaultValue: 'application/json',
      advanced: true,
      // TODO: do automatically if file input
      enum: [
        'application/json',
        'multipart/form-data',
        'application/x-www-form-urlencoded',
      ],
      showIf:
        'options.get("sendSubmissionsTo") === "custom" && options.get("sendWithJs") === true',
    },
    {
      name: 'method',
      type: 'string',
      showIf: 'options.get("sendSubmissionsTo") === "custom"',
      defaultValue: 'POST',
      advanced: true,
    },
    {
      name: 'previewState',
      type: 'string',
      // TODO: persist: false flag
      enum: ['unsubmitted', 'sending', 'success', 'error'],
      defaultValue: 'unsubmitted',
      helperText:
        'Choose a state to edit, e.g. choose "success" to show what users see on success and edit the message',
      showIf:
        'options.get("sendSubmissionsTo") !== "zapier" && options.get("sendWithJs") === true',
    },
    {
      name: 'successUrl',
      type: 'url',
      helperText:
        'Optional URL to redirect the user to on form submission success',
      showIf:
        'options.get("sendSubmissionsTo") !== "zapier" && options.get("sendWithJs") === true',
    },
    {
      name: 'resetFormOnSubmit',
      type: 'boolean',
      showIf:
        "options.get('sendSubmissionsTo') === 'custom' && options.get('sendWithJs') === true",
      advanced: true,
    },
    {
      name: 'successMessage',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [
        {
          '@type': '@builder.io/sdk:Element',
          responsiveStyles: {
            large: {
              marginTop: '10px',
            },
          },
          component: {
            name: 'Text',
            options: {
              text: '<span>Thanks!</span>',
            },
          },
        },
      ],
    },
    {
      name: 'validate',
      type: 'boolean',
      defaultValue: true,
      advanced: true,
    },
    {
      name: 'errorMessagePath',
      type: 'text',
      advanced: true,
      helperText:
        'Path to where to get the error message from in a JSON response to display to the user, e.g. "error.message" for a response like { "error": { "message": "this username is taken" }}',
    },
    {
      name: 'errorMessage',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [
        {
          '@type': '@builder.io/sdk:Element',
          responsiveStyles: {
            large: {
              marginTop: '10px',
            },
          },
          bindings: {
            'component.options.text':
              'state.formErrorMessage || block.component.options.text',
          },
          component: {
            name: 'Text',
            options: {
              text: '<span>Form submission error :( Please check your answers and try again</span>',
            },
          },
        },
      ],
    },
    {
      name: 'sendingMessage',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [
        {
          '@type': '@builder.io/sdk:Element',
          responsiveStyles: {
            large: {
              marginTop: '10px',
            },
          },
          component: {
            name: 'Text',
            options: {
              text: '<span>Sending...</span>',
            },
          },
        },
      ],
    },
    {
      name: 'customHeaders',
      type: 'map',
      valueType: {
        type: 'string',
      },
      advanced: true,
      showIf:
        'options.get("sendSubmissionsTo") === "custom" && options.get("sendWithJs") === true',
    },
  ],
  noWrap: true,
  canHaveChildren: true,
  defaultChildren: [
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '10px',
        },
      },
      component: {
        name: 'Text',
        options: {
          text: '<span>Enter your name</span>',
        },
      },
    },
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '10px',
        },
      },
      component: {
        name: 'Form:Input',
        options: {
          name: 'name',
          placeholder: 'Jane Doe',
        },
      },
    },
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '10px',
        },
      },
      component: {
        name: 'Text',
        options: {
          text: '<span>Enter your email</span>',
        },
      },
    },
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '10px',
        },
      },
      component: {
        name: 'Form:Input',
        options: {
          name: 'email',
          placeholder: 'jane@doe.com',
        },
      },
    },
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '10px',
        },
      },
      component: {
        name: 'Form:SubmitButton',
        options: {
          text: 'Submit',
        },
      },
    },
  ],
};
