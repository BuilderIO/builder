import {
  RenderContent,
  getBuilderSearchParams,
  getContent,
  // @ts-ignore
} from '@builder.io/sdk-react-nextjs';
import MyTextBox from '../../components/MyTextBox/MyTextBox';
import { componentInfo } from '../../components/MyTextBox/component-info';
import CatFacts from '@/components/MyTextBox/CatFacts';
const REAL_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660';

interface MyPageProps {
  params: {
    slug: string[];
  };
  searchParams: Record<string, string>;
}

// Pages are Server Components by default
export default async function Page(props: MyPageProps) {
  const urlPath = '/' + (props.params?.slug?.join('/') || '');

  const content = await getContent({
    model: 'page',
    apiKey: REAL_API_KEY,
    options: getBuilderSearchParams(props.searchParams),
    userAttributes: {
      urlPath,
    },
  });

  return (
    <RenderContent
      content={content}
      model="page"
      apiKey={REAL_API_KEY}
      customComponents={[
        {
          ...componentInfo,
          component: MyTextBox,
        },
        {
          name: 'CatFacts',
          component: CatFacts,
          inputs: [
            {
              name: 'text',
              type: 'text',
              defaultValue: 'default text',
            },
          ],
        },
      ]}
    />
  );
}
export const revalidate = 1;
