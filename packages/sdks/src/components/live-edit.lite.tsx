import { useContext, useStore } from "@builder.io/mitosis";
import type { BuilderBlock, BuilderContent } from "../server-index.js";
import { BuilderContext } from "../context/index.js";

type LiveEditProps = {
  children: any;
  id: string;
  component: any;
  attributes: any;
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
    _findBlockById(blocks: BuilderBlock[] | undefined, id: string): BuilderBlock | null {
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
    findBlockById(content: BuilderContent, id: string){
        return this._findBlockById(content.data?.blocks, id);
    },
    get block() {
        return this.findBlockById(context.value.content!, props.id);
    },
    get options() {
        return this.block?.component?.options || {};
    },
  })


  return <props.component {...props} {...state.options} />;
}
