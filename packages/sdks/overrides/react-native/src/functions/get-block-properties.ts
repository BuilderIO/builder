import type { BuilderBlock } from '../types/builder-block.js';
import { isEditing } from './is-editing.js';
import { findDOMNode } from 'react-dom';

export function getBlockProperties(block: BuilderBlock) {
  return {
    ...block.properties,
    ref: (ref) => {
      if (isEditing()) {
        const el = findDOMNode(ref);
        if (el) {
          el.setAttribute('builder-id', block.id);
          el.classList.add(block.id);
        }
      }
    },
    dataSet: {
      'builder-id': block.id,
      class: [block.id, 'builder-block', block.class].filter(Boolean).join(' '),
    },
  };
}
