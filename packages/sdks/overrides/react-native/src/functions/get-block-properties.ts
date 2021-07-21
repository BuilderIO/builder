import { BuilderBlock } from '../types/builder-block';
import { findDOMNode } from 'react-dom';

export function getBlockProperties(block: BuilderBlock) {
  // TODO: bindings
  return {
    ...block.properties,
    ref: ref => {
      const el = findDOMNode(ref);
      if (el) {
        el.setAttribute('builder-id', block.id);
        el.classList.add(block.id);
      }
    },
    dataSet: {
      'builder-id': block.id,
      class: [block.id, 'builder-block', block.class].filter(Boolean).join(' '),
    },
  };
}
