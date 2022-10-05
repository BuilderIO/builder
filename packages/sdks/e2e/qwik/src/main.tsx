import { component$ } from '@builder.io/qwik';
import { RenderContent } from '@builder.io/sdk-qwik';
import { getContentForPathname } from '@builder.io/sdks-e2e-tests';

export interface MainProps {
  url: string;
}
export const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore
export const Main = component$((props: MainProps) => {
  const content = getContentForPathname(new URL(props.url).pathname);
  return (
    <RenderContent
      model="page"
      content={content}
      apiKey={BUILDER_PUBLIC_API_KEY}
    />
  );
});
