const path = require('path')
const pkg = require('./package.json')
const common = require('./webpack.common.js')

const config = {
  ...common,
}

const system = {
  ...config,
  output: {
    filename: `${pkg.output}.system.js`,
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'system',
  },
}

module.exports = system
