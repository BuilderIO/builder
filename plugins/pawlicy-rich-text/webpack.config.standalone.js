const pkg = require('./package.json')
const path = require('path')
const common = require('./webpack.common.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const config = {
  ...common,
}

const udm = {
  ...config,
  entry: `./src/Demo.tsx`,
  output: {
    filename: `${pkg.output}.umd.js`,
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
  },
  plugins: [
    ...common.plugins,
    new HtmlWebpackPlugin({
      template: 'demo/index.html',
    }),
  ],
}

delete udm.externals

module.exports = udm
