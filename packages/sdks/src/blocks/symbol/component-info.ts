import type { ComponentInfo } from '../../types/components';

export const componentInfo: ComponentInfo = {
  name: 'Symbol',
  noWrap: true,
  static: true,

  inputs: [
    {
      name: 'symbol',
      type: 'uiSymbol',
    },
    {
      name: 'dataOnly',
      helperText: "Make this a data symbol that doesn't display any UI",
      type: 'boolean',
      defaultValue: false,
      advanced: true,
      hideFromUI: true,
    },
    {
      name: 'inheritState',
      helperText: 'Inherit the parent component state and data',
      type: 'boolean',
      defaultValue: false,
      advanced: true,
    },
    {
      name: 'renderToLiquid',
      helperText:
        'Render this symbols contents to liquid. Turn off to fetch with javascript and use custom targeting',
      type: 'boolean',
      defaultValue: false,
      advanced: true,
      hideFromUI: true,
    },
    {
      name: 'useChildren',
      hideFromUI: true,
      type: 'boolean',
    },
  ],
};
