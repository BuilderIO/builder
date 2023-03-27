import {
  useComputed$,
  component$,
  createContextId,
  useContext,
  useContextProvider,
  useStore,
  $,
} from '@builder.io/qwik';

type State = { foo: number };
type Binding = { code: string; path: string };
type Context = {
  state: State;
  content: {
    data: {
      buttonSetter: Binding;
      textGetter: Binding;
    };
  };
};
export const builderContext = createContextId<Context>('Builder');

export const getBindings = (context) => {
  const binding = {
    [context.content.data.buttonSetter.path + '$']: $(() =>
      evaluate(context.content.data.buttonSetter.code, context.state)()
    ),
  };
  return binding;
};

export const ButtonWithProxy = component$((props) => {
  const context = useContext(builderContext);

  const bindings = useComputed$(() => getBindings(context));

  return (
    <>
      BLOCK WITH STATE: {(context.state as any)?.reactiveValue}
      <button {...bindings.value}>
        PROXY increment foo. Current: {context.state.foo}
      </button>
    </>
  );
});

export const TextContent = component$(
  (props: { text?: string; text2?: string; text3?: string }) => {
    return (
      <div>
        <div>Child Text defined in useStore bindings: {props.text}</div>
        <div>Child Text defined in useStore text: {props.text3}</div>
        <div>Child Text defined in prop directly: {props.text2}</div>
      </div>
    );
  }
);

export const getB = (context) => {
  return {
    [context.content.data.textGetter.path]: evaluate(
      context.content.data.textGetter.code,
      context.state
    ),
  };
};
export const RenderBlock = component$((props) => {
  const context = useContext(builderContext);

  const bindings = useComputed$(() => getB(context));

  return (
    <>
      <TextContent
        {...bindings.value}
        text2="hello"
        // text2={bindings.value.text}
      />
    </>
  );
});

export const evaluate = (code: string, state: State) => {
  return new Function('state', code)(state);
};

export default component$(() => {
  const state = useStore(
    {
      state: { foo: 123 },
      content: {
        data: {
          buttonSetter: {
            code: `
            console.log('updating:', state.foo)
            state.foo = state.foo + 1;
          `,
            path: 'onClick',
          },
          textGetter: {
            code: `
            console.log('text getter: ', state.foo)
            return state.foo
          `,
            path: 'text',
          },
        },
      },
    },
    { recursive: true }
  );

  useContextProvider(
    builderContext,
    useStore({
      state: state.state,
      content: state.content,
    })
  );

  return (
    <div>
      <div>Parent foo: {state.state.foo}</div>
      <ButtonWithProxy />
      <RenderBlock />
    </div>
  );
});

/**
 * Minimal implementation of lodash's _.set
 * https://lodash.com/docs/4.17.15#set
 *
 * See ./set.test.ts for usage examples
 */
export const set = (obj: any, _path: string | string[], value: any) => {
  if (Object(obj) !== obj) {
    return obj;
  }
  const path: string[] = Array.isArray(_path)
    ? _path
    : (_path.toString().match(/[^.[\]]+/g) as string[]);

  path
    .slice(0, -1)
    .reduce(
      (a, c, i) =>
        Object(a[c]) === a[c]
          ? a[c]
          : (a[c] =
              Math.abs(Number(path[i + 1])) >> 0 === +path[i + 1] ? [] : {}),
      obj
    )[path[path.length - 1]] = value;
  return obj;
};
