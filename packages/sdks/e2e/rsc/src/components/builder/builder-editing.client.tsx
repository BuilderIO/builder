import {
  BuilderEditingWrapper,
  BuilderEditingProps,
} from '@builder.io/sdk-react/rsc';
import { useNavigate } from '@shopify/hydrogen';
import throttle from 'lodash.throttle';

export function BuilderEditing(props: BuilderEditingProps) {
  const navigate = useNavigate();

  return (
    <BuilderEditingWrapper
      {...props}
      components={props.components.map((cmp) => ({
        ...cmp,
        component: undefined,
      }))}
      onUpdate={throttle(
        (content) => {
          // On update, post to the server to be able to serve the latest draft
          // in real time
          fetch('/api/builderData', {
            body: JSON.stringify(content),
            method: 'POST',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
            },
          }).then(() => {
            const current = new URL(window.location.href);
            current.searchParams.set('v', String(Date.now()));
            // TODO: get ahoud of useNavigate
            navigate(current.pathname + current.search, {
              scroll: false,
            });
          });
        },
        100,
        { trailing: true, leading: true }
      )}
    />
  );
}
