import { onMount, useContext, useStore, useTarget } from '@builder.io/mitosis';
import { BuilderContext } from '../context/index.js';
import { findBlockById } from '../helpers/find-block.js';

type LiveEditProps = {
  children?: any;
  id?: any;
  Wrapper?: any;
  attributes?: any;
  targetWrapperProps?: any;
};

export default function LiveEdit(props: LiveEditProps) {
  const context = useContext(BuilderContext);

  const state = useStore({
    get block() {
      return findBlockById(context.value.content!, props.id);
    },

    get options() {
      return this.block?.component?.options || {};
    },
  });

  onMount(() => {
    useTarget({
      angular: () => {
        /** this is a hack to include unused props */
        const _ = {
          a: props.id,
          b: props.Wrapper,
          c: props.attributes,
          d: props.children,
        };
      },
    });
  });
  
  return (
    <props.Wrapper {...state.options} {...props.targetWrapperProps} attributes={props.attributes}>
      {props.children}
    </props.Wrapper>
  );
}