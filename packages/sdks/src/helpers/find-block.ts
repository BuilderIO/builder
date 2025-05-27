import type { BuilderBlock, BuilderContent } from '../server-index.js';

/**
 * Recursively searches for a block by ID.
 *
 * @param content The Builder content to search through.
 * @param id The ID of the block to search for.
 * @returns The block if found, otherwise null.
 */
export const findBlockById = (
  content: BuilderContent,
  id: string
): BuilderBlock | null => {
  return findBlockInTree(content.data?.blocks, id);
};

/**
 * Helper function to recursively search through block tree.
 *
 * @param blocks The blocks to search through.
 * @param id The ID of the block to search for.
 * @returns The block if found, otherwise null.
 * @private This is an internal implementation detail.
 */
export const findBlockInTree = (
  blocks: BuilderBlock[] | undefined,
  id: string
): BuilderBlock | null => {
  if (!blocks) return null;
  for (const block of blocks) {
    if (block.id === id) return block;

    if (block.children) {
      const child = findBlockInTree(block.children, id);
      if (child) return child;
    }

    if (block.component?.name === 'Columns' && block.component?.options?.columns) {
      for (const column of block.component.options.columns) {
        if (column.blocks) {
          const child = findBlockInTree(column.blocks, id);
          if (child) return child;
        }
      }
    }
  }
  return null;
};
