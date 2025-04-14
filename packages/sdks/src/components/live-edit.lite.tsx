import { onMount, useContext, useStore, useTarget } from '@builder.io/mitosis';
import { BuilderContext } from '../context/index.js';
import type { BuilderBlock, BuilderContent } from '../server-index.js';

type LiveEditProps = {
  children?: any;
  id?: any;
  component?: any;
  attributes?: any;
};

export default function LiveEdit(props: LiveEditProps) {
  const context = useContext(BuilderContext);

  const state = useStore({
    /**
     * Recursively searches for a block by ID.
     *
     * @param blocks The blocks to search through.
     * @param id The ID of the block to search for.
     * @returns The block if found, otherwise null.
     */
    _findBlockById(
      blocks: BuilderBlock[] | undefined,
      id: string
    ): BuilderBlock | null {
      if (!blocks) return null;
      for (const block of blocks) {
        if (block.id === id) return block;

        if (block.children) {
          const child = this._findBlockById(block.children, id);
          if (child) return child;
        }
      }
      return null;
    },
    findBlockById(content: BuilderContent, id: string) {
      return this._findBlockById(content.data?.blocks, id);
    },
    get block() {
      return this.findBlockById(context.value.content!, props.id);
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
          b: props.component,
          c: props.attributes,
          d: props.children,
        };
      },
    });
  });

  return (
    <props.component {...state.options} {...props.attributes}>
      {props.children}
    </props.component>
  );
}
