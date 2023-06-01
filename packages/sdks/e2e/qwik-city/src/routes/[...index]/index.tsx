import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { RenderContent } from '@builder.io/sdk-qwik';
import { getProps } from '@builder.io/sdks-e2e-tests';

export interface MainProps {
  url: string;
}

export const useBuilderContentLoader = routeLoader$(async (event) => {
  const data = await getProps(event.url.pathname);

  if (!data) {
    event.status(404);
  }

  return data;
});

export default component$(() => {
  const contentProps = useBuilderContentLoader();
  return contentProps.value ? (
    <RenderContent {...contentProps.value} />
  ) : (
    <div>Content Not Found</div>
  );
});
