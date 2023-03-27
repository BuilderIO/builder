import { component$ } from '@builder.io/qwik';
import { RenderContent } from '@builder.io/sdk-qwik';
import { getProps } from '@builder.io/sdks-e2e-tests';
import { getCustomComponents } from '@builder.io/sdks-tests-custom-components/output/qwik/src/index';

export interface MainProps {
  url: string;
}
export const Main = component$((props: MainProps) => {
  const pathname = new URL(props.url).pathname;
  const contentProps = {
    ...getProps(pathname),
    customComponents: getCustomComponents(pathname),
  };
  return contentProps ? (
    <RenderContent {...contentProps} />
  ) : (
    <div>Content Not Found</div>
  );
});
