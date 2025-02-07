// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  webpack: config => {
    config.resolve.alias['react'] = path.resolve(__dirname, './node_modules/react');
    return config;
  },
};

module.exports = nextConfig;
