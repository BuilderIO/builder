import CatFacts from '@/components/MyTextBox/CatFacts';
import {
  Content,
  _processContentResult,
  fetchOneEntry,
  getBuilderSearchParams,
} from '@builder.io/sdk-react-nextjs';
import { getProps } from '@e2e/tests';
import MyTextBox from '../../components/MyTextBox/MyTextBox';
import { componentInfo } from '../../components/MyTextBox/component-info';

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
    _processContentResult,
    options: getBuilderSearchParams(props.searchParams),
    fetchOneEntry,
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
    <Content
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
  );
}
export const revalidate = 1;

// TO-DO: this breaks the build.
// Return a list of `params` to populate the [slug] dynamic segment
// export async function generateStaticParams() {
//   return getAllPathnames('gen2').map((path) => ({
//     slug: path === '/' ? null : path.split('/').filter(Boolean),
//   }));
// }
