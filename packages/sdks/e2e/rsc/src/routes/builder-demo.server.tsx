import {Layout} from '~/components/index.server';
import {RenderServerContent, getContent, RegisteredComponent} from '@builder.io/sdk-react/rsc';
import {useUrl, useQuery} from '@shopify/hydrogen';
import {builderEditingContentCache} from '../routes/api/builderData.server';
import {BuilderEditing} from '../components/builder/builder-editing.client';
import { Button, Heading, Section } from '../components/index';
import { TopProducts } from '../components/sections/ProductSwimlane.server';
import { SearchBlock } from '../components/search/SearchBlock.server';
import { RenderBlocks } from '../components/builder/RenderContent.server';

const MODEL_NAME = 'demo';
const BUILDER_PUBLIC_API_KEY = '';

export const CUSTOM_COMPONENTS: RegisteredComponent[] = [
  {
    component: ({text, link}: any) => <Button>{text}</Button>,
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
    component: ({text}: any) => <Heading>{text}</Heading>,
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
    component: ({heading, builderBlock, builderComponents}: any) => (
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
];


export default function BuilderDemo() {
  const {searchParams, pathname} = useUrl();
  const isEditing = searchParams.get('builder.editing') === 'true';

  const content = isEditing
    ? builderEditingContentCache.demo
    : useQuery([MODEL_NAME, pathname], async () => {
        return await getContent({
          model: MODEL_NAME,
          apiKey: BUILDER_PUBLIC_API_KEY,
          userAttributes: {
            urlPath: pathname,
          },
        }).promise();
      });

  const serverContent = <RenderServerContent model="demo" content={content} />;
  return (
    <Layout>
      {isEditing ? (
        // Only when editing, wrap in a client component that adds a tiny bit of code
        // needed for editing
        <BuilderEditing>{serverContent}</BuilderEditing>
      ) : (
        serverContent
      )}
    </Layout>
  );
}
