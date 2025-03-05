/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/product/category/:handle',
        destination: '/product-details/product/category/:handle',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: 'cdn.builder.io',
      },
    ],
  },
};

export default nextConfig;
