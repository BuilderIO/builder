import { getProps } from '@e2e/tests';
import { _processContentResult } from '../../sdk-src';
import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import ContentComponent from '~/sdk-src/components/content/content';

export interface MainProps {
  url: string;
}

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
  return (
    <ContentComponent
      content={{
        data: {
          title: 'Columns',
          blocks: [
            {
              columns: ['<p>text in column 1</p>'],
              id: 'builder-1253ebf62a87451db1a31e103189b5bb',
            },
          ],
        },
        id: 'f24c6940ee5f46458369151cc9ec598c',
      }}
    />
  );
});
