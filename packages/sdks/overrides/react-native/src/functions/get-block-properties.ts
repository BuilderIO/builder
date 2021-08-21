import { BuilderBlock } from '../types/builder-block';
import { findDOMNode } from 'react-dom';
import { isBrowser } from './is-browser';
import { isReactNative } from './is-react-native';

export function getBlockProperties(block: BuilderBlock) {
  return {
    ...block.properties,
    ref: ref => {
      if (isBrowser() && !isReactNative()) {
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
