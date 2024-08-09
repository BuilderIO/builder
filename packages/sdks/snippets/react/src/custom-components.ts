/**
 *  src/custom-components.ts
 */

import { RegisteredComponent } from '@builder.io/sdk-react';
import CustomTabs from './components/CustomTabs';

export const customComponents: RegisteredComponent[] = [
  {
    component: CustomTabs,
    name: 'TabFields',
    /** To accept children in your custom component and by default it is false */
    canHaveChildren: true,
    /** To receieve Builder props inside your custom component: by default false  */
    shouldReceiveBuilderProps: {
      /** To access builder's Blocks relative to your parent */
      builderBlock: true,
    },
    inputs: [
      {
        name: 'tabList',
        type: 'list',

        subFields: [
          {
            name: 'tabName',
            type: 'string',
          },
          {
            name: 'children',
            type: 'uiBlocks',
            hideFromUI: true,
            defaultValue: [
              {
                '@type': '@builder.io/sdk:Element',
                component: {
                  name: 'Text',

                  options: {
                    text: 'This is editable block within the builder editor',
                  },
                },
                responsiveStyles: {
                  large: {
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    flexShrink: '0',
                    boxSizing: 'border-box',
                    marginTop: '8px',
                    lineHeight: 'normal',
                    height: '200px',
                    textAlign: 'left',
                    minHeight: '200px',
                  },
                  small: {
                    height: '200px',
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
];
