// type SdkEnv = 'node' | 'edge' | 'browser';

/**
 * this isn't a costant to make sure the `SDK_ENV` is correctly set by whatever is building the SDK.
 */
const getSdkEnv = () => process.env.SDK_ENV;

const getFilename = () => {
  switch (getSdkEnv()) {
    case 'node':
      return 'node-runtime';
    case 'edge':
      return 'non-node-runtime';
    case 'browser':
      return 'browser-runtime';
    default:
      throw new Error(`Unknown SDK_ENV: ${getSdkEnv()}`);
  }
};

const buildPath = (pointTo) => {
  const fileName = getFilename();

  if (pointTo === 'output') {
    return `./${getSdkEnv()}/functions/evaluate/${fileName}/index.js`;
  }

  return `./${fileName}/index.ts`;
};

/**
 *
 * @param {'output' | 'input'} pointTo
 * @returns
 */
export const getEvaluatorPathAlias = (pointTo) => {
  return {
    'placeholder-runtime': buildPath(pointTo),
  };
};

export const getSdkOutputPath = () => {
  switch (getSdkEnv()) {
    case 'node':
    case 'edge':
    case 'browser':
      return ['lib', getSdkEnv()].join('/');
    default:
      throw new Error(`Unknown SDK_ENV: ${getSdkEnv()}`);
  }
};
