/**
 * @type {import('next').NextConfig}
 */
export default {
  experimental: {
    externalDir: true,
    serverActions: true,
    // serverComponentsExternalPackages: ['isolated-vm'],
  },
  // transpilePackages: ['isolated-vm'],
  webpack: (config) => {
    // TO-DO: why is this still needed?
    config.externals = ['isolated-vm', ...(config.externals || [])];

    return config;
  },
};
