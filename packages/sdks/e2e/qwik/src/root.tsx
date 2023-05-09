import { component$ } from '@builder.io/qwik';
import { RenderContent } from '@builder.io/sdk-qwik';
import { getProps } from '@builder.io/sdks-e2e-tests';

export default component$(() => {
  const contentProps = getProps(window.location.pathname);
  return contentProps ? (
    <RenderContent {...contentProps} />
  ) : (
    <div>Content Not Found</div>
  );
});
