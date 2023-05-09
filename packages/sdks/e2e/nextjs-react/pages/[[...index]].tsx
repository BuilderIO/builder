// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RenderContent } from '@builder.io/sdk-react';
import { getProps } from '@builder.io/sdks-e2e-tests';
import { useRouter } from 'next/router';

const getPathname = (x: string) => {
  if (x === '/[[...index]]') {
    return '/';
  } else {
    return x;
  }
};

function App() {
  const router = useRouter();

  const props = getProps(getPathname(router.asPath));
  return props ? <RenderContent {...props} /> : <div>Content Not Found</div>;
}

export default App;

// we have this empty fn to force NextJS to opt out of static optimization
// https://nextjs.org/docs/advanced-features/automatic-static-optimization
export async function getServerSideProps() {
  return {
    props: {}, // will be passed to the page component as props
  };
}
