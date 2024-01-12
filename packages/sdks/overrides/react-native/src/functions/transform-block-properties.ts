import { findDOMNode } from 'react-dom';
import type { BuilderBlock } from '../types/builder-block.js';
import { getReactNativeBlockStyles } from './get-react-native-block-styles.js';
import { isEditing } from './is-editing.js';

export function transformBlockProperties(block: BuilderBlock, context) {
  block.style = getReactNativeBlockStyles({
    block,
    context,
    blockStyles: block.style,
  });

  block.className = block.class;
  delete block.class;

  const id = block['builder-id'];

  if (!id && isEditing()) {
    console.warn('No builder-id found on block', block);
  }

  block.ref = (ref) => {
    if (isEditing()) {
      const el = findDOMNode(ref);
      if (el) {
        el.setAttribute('builder-id', id);
        el.classList.add(id);
      }
    }
  };
  return block;
}
