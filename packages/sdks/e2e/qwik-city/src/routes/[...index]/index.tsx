import { component$ } from '@builder.io/qwik';
import ContentComponent from '~/sdk-src/components/content/content';

export interface MainProps {
  url: string;
}

export default component$(() => {
  return (
    <ContentComponent
      content={{
        data: {
          blocks: [
            {
              columns: ['<p>text in column 1</p>'],
            },
          ],
        },
      }}
    />
  );
});
