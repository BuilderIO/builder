/**
 * @type {import('next').NextConfig}
 */
export default {
  experimental: {
    /**
     * This setting is required for Builder's Visual Editor to work with your site.
     */
    serverActions: true,
  },
  /**
   * This setting is required for Builder's Visual Editor to work with your site.
   */
  transpilePackages: ['@builder.io/sdk-react-nextjs'],
};
