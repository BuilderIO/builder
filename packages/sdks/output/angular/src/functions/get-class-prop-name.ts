import { TARGET } from '../constants/target';
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
    case 'angular':
      return 'class';
  }
}