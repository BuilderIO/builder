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
 * @typedef {{
 *  pointTo: 'output' | 'input' | 'full-input',
 *  format: 'ts' | 'js'
 * }} options
 */

/**
 *
 * @param {options} options
 * @returns
 */
const buildPath = ({ pointTo, format }) => {
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
 * @param {Partial<options>} options
 * @returns
 */
export const getEvaluatorPathAlias = (
  { pointTo = 'input', format = 'ts' } = { pointTo: 'input', format: 'ts' }
) => {
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

/**
 * Sets the build `outDir` for the runtime, and the path `alias` for the runtime evaluator.
 * @param {Partial<options>} options
 * @returns {import('vite').UserConfig}
 */
export const outputGenerator = (options = {}) => {
  /**
   * @type {import('vite').Plugin}
   */
  const plugin = {
    config: () => ({
      resolve: {
        alias: getEvaluatorPathAlias(options),
      },
      build: {
        outDir: getSdkOutputPath(),
      },
    }),
  };
  return plugin;
};
