/**
 * @type {import('next').NextConfig}
 */
export default {
  experimental: {
    externalDir: true,
    serverActions: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
