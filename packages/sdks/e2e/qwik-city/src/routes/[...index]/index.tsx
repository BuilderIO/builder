import { Content, fetchBuilderProps } from '../../sdk-src';
import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export interface MainProps {
  url: string;
}

export const useBuilderContentLoader = routeLoader$(async (event) => {
  const data = await fetchBuilderProps({
    url: event.url,
    apiKey: 'f1a790f8c3204b3b8c5c1795aeac4660',
  });

  if (!data) {
    event.status(404);
  }

  return data;
});

export default component$(() => {
  const contentProps = useBuilderContentLoader();
  return <Content {...contentProps.value} />;
});
