// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  /**
   * `useIsPreviewing` uses a different react version while linking so here are resolving it
   * this is not required when using the SDK directly
   */
  webpack: (config) => {
    config.resolve.alias['react'] = path.resolve(
      __dirname,
      './node_modules/react'
    );
    return config;
  },
};

module.exports = nextConfig;
