import { component$ } from '@builder.io/qwik';
// import { evaluator } from '@builder.io/my-lib';
import { evaluator } from '@builder.io/sdk-qwik';

export default component$(() => {
  const v = evaluator({
    code: 'return 1+ 40',
    builder: {
      isEditing: true,
      isBrowser: true,
      isServer: true,
      getUserAttributes: () => ({} as any),
    },
    context: {},
    event: undefined,
    rootSetState: undefined,
    rootState: {},
    localState: {},
  });
  console.log('v:', v);

  return <div>hello: {v}</div>;
});
