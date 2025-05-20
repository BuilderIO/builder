import type { RegisteredComponent } from '@builder.io/sdk-angular';
import { BuilderBlockWithClassNameComponent } from './custom-components/builder-block-with-class-name.component';
import { CustomButtonComponent } from './custom-components/custom-button.component';
import { CustomCardContentComponent } from './custom-components/custom-card-content.component';
import { CustomCardFooterComponent } from './custom-components/custom-card-footer.component';
import { CustomCardTitleComponent } from './custom-components/custom-card-title.component';
import { CustomCardComponent } from './custom-components/custom-card.component';
import { HelloComponent } from './custom-components/hello.component';

export const customComponents: RegisteredComponent[] = [
  {
    component: HelloComponent,
    name: 'Hello',
    inputs: [],
    defaultChildren: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-ebca7d55d34f4fc9a6536600959cef5d',
        component: {
          name: 'Text',
          options: {
            text: 'inside an h1',
          },
        },
      },
    ],
  },
  {
    name: 'BuilderBlockWithClassName',
    component: BuilderBlockWithClassNameComponent,
    shouldReceiveBuilderProps: {
      builderBlock: true,
      builderContext: true,
      builderComponents: true,
    },
    inputs: [
      {
        name: 'content',
        type: 'uiBlocks',
        defaultValue: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-c6e179528dee4e62b337cf3f85d6496f',
            component: {
              name: 'Text',
              options: {
                text: 'Enter some text...',
              },
            },
            responsiveStyles: {
              large: {
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                flexShrink: '0',
                boxSizing: 'border-box',
                marginTop: '20px',
                lineHeight: 'normal',
                height: 'auto',
              },
            },
          },
        ],
      },
    ],
  },
  {
    name: 'CustomButton',
    component: CustomButtonComponent,
    noWrap: true,
    canHaveChildren: true,
  },
  {
    name: 'CustomCard',
    component: CustomCardComponent,
    noWrap: true,
    canHaveChildren: true,
  },
  {
    name: 'CustomCardTitle',
    component: CustomCardTitleComponent,
    noWrap: true,
    canHaveChildren: true,
  },
  {
    name: 'CustomCardFooter',
    component: CustomCardFooterComponent,
    noWrap: true,
    canHaveChildren: true,
  },
  {
    name: 'CustomCardContent',
    component: CustomCardContentComponent,
    noWrap: true,
    canHaveChildren: true,
  },
];
