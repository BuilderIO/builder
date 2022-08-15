export const MutationConfig = {
  name: 'Builder:Mutation',
  canHaveChildren: true,
  noWrap: true,
  hideFromInsertMenu: true,
  inputs: [
    {
      name: 'type',
      type: 'string',
      defaultValue: 'replace',
      enum: [
        {
          label: 'Replace',
          value: 'replace',
          helperText: 'Replace the contents of this site region with content from Builder',
        },
        {
          label: 'Append',
          value: 'afterEnd',
          helperText: 'Append Builder content after the chosen site region',
        },
      ],
    },
    {
      name: 'selector',
      // TODO: special UI for this
      type: 'builder:domSelector',
    },
  ],
};
