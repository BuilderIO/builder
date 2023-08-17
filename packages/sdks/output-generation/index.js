/**
 * This isn't a constant to make sure the `SDK_ENV` is correctly set by whatever is building the SDK.
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
      throw new Error(
        `Unknown SDK_ENV: ${getSdkEnv()}. Expected one of 'node', 'edge', 'browser'.`
      );
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
 * @param {Partial<options>} options
 * @returns
 */
export const getEvaluatorPathAlias = (options) => {
  const pointTo = options.pointTo || 'input';
  const format = options.format || 'ts';

  const buildPath = () => {
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
