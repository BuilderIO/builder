/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['isolated-vm'],
  },
};

export default nextConfig;
