import { onMount, useContext, useStore, useTarget } from '@builder.io/mitosis';
import { BuilderContext } from '../context/index.js';
import type { BuilderBlock, BuilderContent } from '../server-index.js';

type LiveEditProps = {
  children?: any;
  id?: any;
  Wrapper?: any;
  attributes?: any;
};

export default function LiveEdit(props: LiveEditProps) {
  const context = useContext(BuilderContext);

  const state = useStore({
    /**
     * Recursively searches for a block by ID.
     *
     * @param content The Builder content to search through.
     * @param id The ID of the block to search for.
     * @returns The block if found, otherwise null.
     */
    findBlockById(content: BuilderContent, id: string): BuilderBlock | null {
      return this.findBlockInTree(content.data?.blocks, id);
    },

    /**
     * Helper function to recursively search through block tree.
     * 
     * @param blocks The blocks to search through.
     * @param id The ID of the block to search for.
     * @returns The block if found, otherwise null.
     * @private This is an internal implementation detail.
     */
    findBlockInTree(
      blocks: BuilderBlock[] | undefined,
      id: string
    ): BuilderBlock | null {
      if (!blocks) return null;
      for (const block of blocks) {
        if (block.id === id) return block;

        if (block.children) {
          const child = this.findBlockInTree(block.children, id);
          if (child) return child;
        }
      }
      return null;
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
          b: props.Wrapper,
          c: props.attributes,
          d: props.children,
        };
      },
    });
  });
  
  return (
    <props.Wrapper {...state.options} attributes={props.attributes}>
      {props.children}
    </props.Wrapper>
  );
}