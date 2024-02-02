import { TARGET } from '../constants/target.js';

export const getClassPropName = () => {
  switch (TARGET) {
    case 'react':
    case 'reactNative':
    case 'rsc':
      return 'className';
    case 'svelte':
    case 'vue':
    case 'solid':
    case 'qwik':
      return 'class';
  }
};
