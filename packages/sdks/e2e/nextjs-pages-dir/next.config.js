const {
  withHydrationOverlay,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require('@builder.io/react-hydration-overlay/next');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  /**
   * This setting is required for Builder's Visual Editor to work with your site.
   */
  transpilePackages: ['@builder.io/sdk-react-nextjs'],
};

module.exports = withHydrationOverlay()(nextConfig);
