// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RenderContent } from '@builder.io/sdk-react';
import { getContentForPathname } from '@builder.io/sdks-e2e-tests';
import { useRouter } from 'next/router';

// TODO: enter your public API key
const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

const getPathname = (x: string) => {
  if (x === '/[[...index]]') {
    return '/';
  } else {
    return x;
  }
};

function App() {
  const router = useRouter();

  const content = getContentForPathname(getPathname(router.asPath));
  return content ? (
    <RenderContent
      content={content}
      model="page"
      apiKey={BUILDER_PUBLIC_API_KEY}
    />
  ) : (
    <div>Content Not Found</div>
  );
}

export default App;
