import { useContext, useStore } from '@builder.io/mitosis';
import { BuilderContext } from '../context/index.js';
import { findBlockById } from '../helpers/find-block.js';

type LiveEditProps = {
  children?: any;
  id?: any;
  Wrapper?: any;
  attributes?: any;
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

  return (
    <props.Wrapper
      {...state.options}
      attributes={props.attributes}
    >
      {props.children}
    </props.Wrapper>
  );
}
