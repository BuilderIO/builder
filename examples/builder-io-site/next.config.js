const withPlugins = require('next-compose-plugins');
const withCSS = require('@zeit/next-css');
const optimizedImages = require('next-optimized-images');

const nextConfiguration = {
  pageExtensions: ['tsx', 'ts', 'js'],
  experimental: {
    modern: true,
    async rewrites() {
      return [
        { source: '/m/:rest*', destination: '/landing' },
        { source: '/c/docs/:rest*', destination: '/docs' },
        { source: '/c/security', destination: '/content' },
        { source: '/c/:rest*', destination: '/content' },
      ];
    },
  },
  catchAllRouting: true,
};

module.exports = withPlugins(
  [
    [withCSS, {}],
    [optimizedImages, {}],
  ],
  nextConfiguration
);
