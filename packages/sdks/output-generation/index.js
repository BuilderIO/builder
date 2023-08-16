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

/**
 *
 * @param {'output' | 'input'} pointTo
 * @param {'ts' | 'js'} format
 * @returns
 */
const buildPath = (pointTo, format) => {
  const fileName = getFilename();

  if (pointTo === 'output') {
    return `./${getSdkEnv()}/functions/evaluate/${fileName}/index.${format}`;
  }

  return `./${fileName}/index.${format}`;
};

/**
 *
 * @param {'output' | 'input'} pointTo
 * @param {'ts' | 'js'} format
 * @returns
 */
export const getEvaluatorPathAlias = (pointTo, format = 'ts') => {
  return {
    'placeholder-runtime': buildPath(pointTo, format),
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
