import { RenderContent, _processContentResult } from '@builder.io/sdk-solid';
import { getProps } from '@e2e/tests';
import { Show, createResource } from 'solid-js';
import { Title, useLocation, useRouteData } from 'solid-start';

export function routeData() {
  const location = useLocation();
  const [props] = createResource(() => {
    return getProps({ pathname: location.pathname, _processContentResult });
  });

  return { props };
}

export default function App() {
  const { props } = useRouteData<typeof routeData>();

  return (
    <main>
      <Title>Hello World</Title>
      <Show when={props} fallback={<div>Content Not Found</div>}>
        <RenderContent {...props()} />
      </Show>
    </main>
  );
}
