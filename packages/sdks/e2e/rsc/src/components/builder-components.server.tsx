import {
  RegisteredComponent,
  RenderBlocks,
  getDefaultRegisteredComponents,
} from '@builder.io/sdk-react/rsc';
import { Button, Heading, Section } from './index';
import { SearchBlock } from './search/SearchBlock.server';
import { TopProducts } from './sections/ProductSwimlane.server';

export const CUSTOM_COMPONENTS: RegisteredComponent[] =
  getDefaultRegisteredComponents().concat([
    {
      component: ({ text, link }: any) => <Button>{text}</Button>,
      name: 'Button',
      inputs: [
        {
          name: 'text',
          type: 'text',
          defaultValue: 'Cool',
        },
      ],
    },
    {
      component: ({ text }: any) => <Heading>{text}</Heading>,
      name: 'Heading',
      inputs: [
        {
          name: 'text',
          type: 'text',
          defaultValue: 'I am a heading',
        },
      ],
    },
    {
      component: TopProducts,
      name: 'TopProducts',
      inputs: [
        {
          name: 'count',
          type: 'number',
          defaultValue: 10,
        },
      ],
    },
    {
      component: SearchBlock,
      name: 'ProductGrid',
      inputs: [
        {
          name: 'search',
          type: 'text',
          defaultValue: 'board',
        },
        {
          name: 'count',
          type: 'number',
          defaultValue: 10,
        },
      ],
    },
    {
      component: ({ heading, builderBlock, builderComponents }: any) => (
        <Section heading={heading}>
          {/* TODO: use context for components */}
          {builderBlock.children && (
            <RenderBlocks
              blocks={builderBlock.children}
              components={builderComponents}
            />
          )}
        </Section>
      ),
      name: 'Section',
      canHaveChildren: true,
      inputs: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'I am section heading',
        },
      ],
    },
  ]);
