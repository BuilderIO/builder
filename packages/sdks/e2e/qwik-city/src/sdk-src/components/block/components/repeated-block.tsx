import BuilderContext from '../../../context/builder.context.js';

import {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../../context/types.js';

import { BuilderBlock } from '../../../types/builder-block.js';

import Block from '../block';

import {
  Fragment,
  component$,
  h,
  useContextProvider,
  useStore,
} from '@builder.io/qwik';

type Props = {
  block: BuilderBlock;
  repeatContext: BuilderContextInterface;
  registeredComponents: RegisteredComponents;
};
export const RepeatedBlock = component$((props: Props) => {
  const state = useStore<any>({ store: props.repeatContext });
  useContextProvider(BuilderContext, state.store);

  return (
    <Block
      block={props.block}
      context={state.store}
      registeredComponents={props.registeredComponents}
    ></Block>
  );
});

export default RepeatedBlock;
