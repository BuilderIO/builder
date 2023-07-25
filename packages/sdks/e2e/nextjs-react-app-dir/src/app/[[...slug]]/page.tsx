import {
  RenderContent,
  getBuilderSearchParams,
  getContent,
  processContentResult,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
} from '@builder.io/sdk-react-nextjs';
import MyTextBox from '../../components/MyTextBox/MyTextBox';
import { componentInfo } from '../../components/MyTextBox/component-info';
import CatFacts from '@/components/MyTextBox/CatFacts';
import { getProps } from '@builder.io/sdks-e2e-tests';

interface MyPageProps {
  params: {
    slug: string[];
  };
  searchParams: Record<string, string>;
}

// Pages are Server Components by default
export default async function Page(props: MyPageProps) {
  const urlPath = '/' + (props.params?.slug?.join('/') || '');

  const builderProps = await getProps({
    pathname: urlPath,
    processContentResult,
    options: getBuilderSearchParams(props.searchParams),
    getContent,
  });

  if (!builderProps) {
    return (
      <>
        <h1>404</h1>
        <p>Make sure you have your content published at builder.io.</p>
      </>
    );
  }

  return (
    <div>
      <RenderContent
        {...builderProps}
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
    </div>
  );
}
export const revalidate = 4;
