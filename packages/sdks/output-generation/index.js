// type SdkEnv = 'node' | 'edge' | 'browser';

const SDK_ENV = process.env.SDK_ENV;

const getFilename = () => {
  switch (SDK_ENV) {
    case 'node':
      return 'node-runtime';
    case 'edge':
      return 'non-node-runtime';
    case 'browser':
      return 'browser-runtime';
    default:
      throw new Error(`Unknown SDK_ENV: ${SDK_ENV}`);
  }
};

const buildPath = (pointTo) => {
  const fileName = getFilename();

  if (pointTo === 'output') {
    return `./${SDK_ENV}/functions/evaluate/${fileName}/index.js`;
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
    './placeholder-runtime.js': buildPath(pointTo),
  };
};

export const getSdkOutputPath = () => {
  switch (SDK_ENV) {
    case 'node':
    case 'edge':
    case 'browser':
      return ['lib', process.env.SDK_ENV].join('/');
    default:
      throw new Error(`Unknown SDK_ENV: ${SDK_ENV}`);
  }
};
