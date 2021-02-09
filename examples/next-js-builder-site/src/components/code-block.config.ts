export const codeBlockConfig = {
  name: 'Code Block',
  inputs: [
    {
      name: 'code',
      type: 'longText',
      defaultValue: 'const incr = num => num + 1',
    },
    {
      name: 'language',
      type: 'string',
      defaultValue: 'javascript',
    },
    {
      name: 'dark',
      type: 'boolean',
      defaultValue: false,
    },
  ],
};
