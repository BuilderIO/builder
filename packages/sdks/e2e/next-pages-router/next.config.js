const {
  withHydrationOverlay,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require('@builder.io/react-hydration-overlay/next');

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withHydrationOverlay()(nextConfig);
