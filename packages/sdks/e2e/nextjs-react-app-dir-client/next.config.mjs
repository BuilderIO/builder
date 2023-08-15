/**
 * @type {import('next').NextConfig}
 */
export default {
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    // TO-DO: why is this still needed?
    config.externals = ['isolated-vm', ...(config.externals || [])];

    return config;
  },
};
