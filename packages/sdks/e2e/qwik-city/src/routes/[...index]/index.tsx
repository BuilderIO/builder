import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { RenderContent } from '@builder.io/sdk-qwik';
import { getProps } from '@builder.io/sdks-e2e-tests';

export interface MainProps {
  url: string;
}
export default component$(() => {
  const { url } = useLocation();

  const contentProps = getProps(url.pathname);
  return contentProps ? (
    <RenderContent {...contentProps} />
  ) : (
    <div>Content Not Found</div>
  );
});
