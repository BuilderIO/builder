import { Component } from '@builder.io/sdk';

export const codeSnippetsConfig: Component = {
  name: 'CodeSnippets',
  inputs: [
    {
      name: 'modelName',
      type: 'string',
      helperText: 'The name of the model for code snippets, e.g. "page"',
    },
    {
      name: 'modelType',
      type: 'string',
      defaultValue: 'page',
      helperText: 'The type of model',
      enum: ['page', 'section', 'data'],
    },
    {
      name: 'tabs',
      type: 'string',
      defaultValue: '',
      helperText:
        'Use this option to manually choose which tabs to include and in what order, separated by commas. E.g. "react,next,gatsby"',
      advanced: true,
    },
    {
      name: 'overrideTabsContent',
      type: 'string',
      defaultValue: '',
      helperText:
        'List any tabs separated by commas you\'d like to not use the default code snippets and manually add content for. E.g. "javascript,vue"',
      advanced: true,
    },
    {
      name: 'customTabContent',
      hideFromUI: true,
      type: 'object',
      defaultValue: {
        // We need an array default value to add custom blocks to for each tap type
        // Yes it's not pretty. Yes it works.
        react: [],
        next: [],
        gatsby: [],
        angular: [],
        vue: [],
        nuxt: [],
        rest: [],
        shopify: [],
        webcomponents: [],
        javascript: [],
        graphql: [],
      },
    },
    {
      name: 'omitTabs',
      type: 'string',
      defaultValue: '',
      helperText:
        'Use this option to manually choose which tabs to not include, separated by commas. E.g. "react,next,gatsby"',
      advanced: true,
    },
    {
      name: 'hideLearnMoreLink',
      type: 'string',
      defaultValue: '',
      helperText:
        'List tabs to not show the "learn more" link for, separated by commas. E.g. "react,next,gatsby"',
      advanced: true,
    },
  ],
};
