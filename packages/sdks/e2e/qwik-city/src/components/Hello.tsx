import { component$ } from '@builder.io/qwik';

export const Hello = component$((props: { context?: any }) => {
  return <div>hello {props.context?.builderContent?.data?.title || 'World'}</div>;
});
