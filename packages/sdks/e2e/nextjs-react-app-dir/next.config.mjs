/**
 * @type {import('next').NextConfig}
 */
export default {
  experimental: {
    externalDir: true,
    appDir: true,
  },
  typescript: {
    tsconfigPath: './tsconfig.nextjs.json',
  },
};
