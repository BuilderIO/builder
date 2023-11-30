import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { RenderContent, _processContentResult } from '@builder.io/sdk-qwik';
import { getProps } from '@e2e/tests';

export const useBuilderContentLoader = routeLoader$(async (event) => {
  const data = await getProps({
    pathname: event.url.pathname,
    _processContentResult,
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
        <RenderContent {...contentProps.value} />
      ) : (
        <div>Content Not Found</div>
      )}
    </>
  );
});
