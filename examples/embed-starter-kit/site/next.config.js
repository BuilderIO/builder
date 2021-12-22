module.exports = {
  images: {
    domains: ['cdn.builder.io'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // This will allow site to be framed under builder.io for wysiwyg editing
          {
            key: 'Content-Security-Policy',
            value:
              'frame-ancestors https://*.builder.io https://builder.io http://localhost:9090 http://localhost:1234',
          },
        ],
      },
    ]
  },
  env: {
    BUILDER_PUBLIC_KEY: process.env.BUILDER_PUBLIC_KEY,
  },
}
