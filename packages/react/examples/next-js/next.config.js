module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias['@builder.io/react'] = '@builder.io/react/server'
    }

    // Fixes npm packages that depend on `fs` module
    config.node = {
      fs: 'empty'
    }

    return config
  }
}
