import type { BuilderBlock } from '../types/builder-block.js';
import { isEditing } from './is-editing.js';
import { findDOMNode } from 'react-dom';

export function transformBlockProperties(block: BuilderBlock) {
  block.ref = (ref) => {
    if (isEditing()) {
      const el = findDOMNode(ref);
      if (el) {
        el.setAttribute('builder-id', block.id);
        el.classList.add(block.id);
      }
    }
  };
  return block;
}
