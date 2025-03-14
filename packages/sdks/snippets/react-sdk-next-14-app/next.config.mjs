/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'cdn.builder.io',
      },
    ],
  },
};

export default nextConfig;
