import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { RenderContent } from '@builder.io/sdk-qwik';
import { getProps } from '@builder.io/sdks-e2e-tests';

export interface MainProps {
  url: string;
}
export const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore
export default component$(() => {
  const { pathname } = useLocation();

  const contentProps = getProps(pathname);
  console.log({ pathname, contentProps });
  return contentProps ? (
    <RenderContent {...contentProps} />
  ) : (
    <div>Content Not Found</div>
  );
});
