import { getProps } from '@builder.io/sdks-e2e-tests';
import { RenderContent } from '@builder.io/sdk-qwik';
import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';

export default component$(() => {
  const { url } = useLocation();

  const contentProps = getProps(url.pathname);
  return contentProps ? (
    <RenderContent {...contentProps} />
  ) : (
    <div>Content Not Found</div>
  );
});
