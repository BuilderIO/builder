import { isEditing } from './is-editing.js';
import { findDOMNode } from 'react-dom';

export function transformBlockProperties<T extends { id?: string }>(block: T) {
  // TO-DO: is this working?
  block.ref = (ref) => {
    if (isEditing()) {
      const el = findDOMNode(ref);
      if (block.id && el && !(el instanceof Text)) {
        el.setAttribute('builder-id', block.id);
        el.classList.add(block.id);
      }
    }
  };
  return block;
}
