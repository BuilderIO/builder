// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RenderContent } from '@builder.io/sdk-react';
import { getProps } from '@builder.io/sdks-e2e-tests';
import { GetServerSideProps } from 'next';

function App({ builderProps }) {
  return builderProps ? (
    <RenderContent {...builderProps} />
  ) : (
    <div>Content Not Found</div>
  );
}

export default App;

// we have this empty fn to force NextJS to opt out of static optimization
// https://nextjs.org/docs/advanced-features/automatic-static-optimization
export const getServerSideProps: GetServerSideProps = async (k) => {
  console.log('getServerSideProps', k.resolvedUrl);
  return {
    props: {
      builderProps: await getProps(k.resolvedUrl),
    },
  };
};
