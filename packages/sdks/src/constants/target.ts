type Target = import('../types/targets.js').Target;

/** This file should be overriden for each framework. Ideally this would be implemented in Mitosis.  */
export const TARGET: Target = ((): any => {
  if (process.env.NODE_ENV === 'test') {
    return 'react';
  }
  throw new Error(
    'Target is not defined. Be sure to create an override file specifying your target like here: https://github.com/builderio/builder/blob/main/packages/sdks/overrides/react-native/src/constants/target.ts'
  );
})();
