import { component$ } from '@builder.io/qwik';
import ContentComponent from '~/sdk-src/components/content/content';

export default component$(() => {
  return (
    <ContentComponent
      content={{
        blocks: ['initial text'],
        id: 'foo',
      }}
    />
  );
});
