/**
 * @type {import('next').NextConfig}
 */
export default {
  experimental: {
    externalDir: true,
    serverActions: true,
  },
  transpilePackages: ['isolated-vm', '@builder.io/sdk-react-nextjs'],
};
