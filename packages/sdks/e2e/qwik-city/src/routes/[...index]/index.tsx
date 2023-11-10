import { getProps } from '@e2e/tests';
import { RenderContent } from '@builder.io/sdk-qwik';
import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export const useBuilderContentLoader = routeLoader$(async (event) => {
  const data = await getProps({
    pathname: event.url.pathname,
  });
  if (!data) {
    event.status(404);
  }
  return data;
});

export default component$(() => {
  const contentProps = useBuilderContentLoader();
  return (
    <>
      {contentProps.value ? (
        <RenderContent {...(contentProps.value as any)} />
      ) : (
        <div>Content Not Found</div>
      )}
    </>
  );
});
