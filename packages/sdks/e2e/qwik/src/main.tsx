import { component$ } from '@builder.io/qwik';
import { RenderContent } from '@builder.io/sdk-qwik';
import { getProps } from '@builder.io/sdks-e2e-tests';

export interface MainProps {
  url: string;
}
export const Main = component$((props: MainProps) => {
  const contentProps = getProps(new URL(props.url).pathname);
  return contentProps ? (
    <RenderContent {...contentProps} />
  ) : (
    <div>Content Not Found</div>
  );
});
