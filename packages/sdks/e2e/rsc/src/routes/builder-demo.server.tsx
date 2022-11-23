import { getContent, RenderContent } from '@builder.io/sdk-react/rsc';
import { useQuery, useSession, useUrl } from '@shopify/hydrogen';
import { Layout } from '~/components/index.server';
import { CUSTOM_COMPONENTS } from '../components/builder-components.server';
import { BuilderEditing } from '../components/builder/builder-editing.client';
import { builderEditingContentCache } from './api/builderData.server';

const MODEL_NAME = 'demo';
const BUILDER_PUBLIC_API_KEY = '8c6ee4960b4d4f5fb8aebf5491b26ea5';

export default function BuilderDemo() {
  const { searchParams, pathname } = useUrl();
  const isEditing = searchParams.get('builder.editing') === 'true';
  const sessionData = useSession();

  const content = isEditing
    ? JSON.parse(
        sessionData[`builderEditingContent:${MODEL_NAME}`] || 'null'
      ) || builderEditingContentCache[MODEL_NAME]
    : useQuery([MODEL_NAME, pathname], async () => {
        return await getContent({
          model: MODEL_NAME,
          apiKey: BUILDER_PUBLIC_API_KEY,
          userAttributes: {
            urlPath: pathname,
          },
        });
      }).data;

  const serverContent = (
    <RenderContent
      model="demo"
      content={content}
      customComponents={CUSTOM_COMPONENTS}
    />
  );

  return (
    <Layout>
      {isEditing ? (
        // Only when editing, wrap in a client component that adds a tiny bit of code
        // needed for editing
        <BuilderEditing
          model="demo"
          components={CUSTOM_COMPONENTS.map((cmp) => ({
            ...cmp,
            component: undefined,
          }))}
        >
          {serverContent}
        </BuilderEditing>
      ) : (
        serverContent
      )}
    </Layout>
  );
}
