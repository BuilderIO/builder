import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Content, _processContentResult } from '@builder.io/sdk-qwik';
import { getProps } from '@sdk/tests';

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
        <Content {...(contentProps.value as any)} />
      ) : (
        <div>Content Not Found</div>
      )}
    </>
  );
});
