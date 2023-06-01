import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import { RenderContent } from '@builder.io/sdk-qwik';
import { getProps } from '@builder.io/sdks-e2e-tests';

export default component$(() => {
  const contentProps = useSignal<any>(null);

  useTask$(() => {
    getProps().then((resp) => {
      contentProps.value = resp;
    });
  });
  return contentProps.value ? (
    <RenderContent {...contentProps.value} />
  ) : (
    <div>Content Not Found</div>
  );
});
