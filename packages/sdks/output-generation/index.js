// type SdkEnv = 'node' | 'edge' | 'browser';

/**
 * this isn't a costant to make sure the `SDK_ENV` is correctly set by whatever is building the SDK.
 */
const getSdkEnv = () => process.env.SDK_ENV;

const getFolderName = () => {
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
 * @param {'output' | 'input' | 'full-input'} pointTo
 * @param {'ts' | 'js'} format
 * @returns
 */
const buildPath = (pointTo, format) => {
  const folder = getFolderName();
  const fileName = `${folder}/index.${format}`;

  switch (pointTo) {
    case 'output':
      return `./${getSdkEnv()}/functions/evaluate/${fileName}`;

    case 'input':
      return `./${fileName}`;

    case 'full-input':
      return `./src/functions/evaluate/${fileName}`;

    default:
      throw new Error(`Unknown pointTo: ${pointTo}`);
  }
};

/**
 *
 * @param {'output' | 'input' | 'full-input'} pointTo
 * @param {'ts' | 'js'} format
 * @returns
 */
export const getEvaluatorPathAlias = (pointTo = 'input', format = 'ts') => {
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
