import { TARGET } from './target.js';

const SDK_NAME_FOR_TARGET = (() => {
  switch (TARGET) {
    case 'rsc':
      return 'react-nextjs';
    case 'reactNative':
      return 'react-native';
    default:
      return TARGET;
  }
})();

export const SDK_NAME = `@builder.io/sdk-${SDK_NAME_FOR_TARGET}` as const;
