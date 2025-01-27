// contents of webpack.config.js
const path = require('path');
const pkg = require('./package.json');

module.exports = {
  entry: `./src/${pkg.entry}.ts`,
  externals: {
    '@builder.io/react': '@builder.io/react',
    '@builder.io/app-context': '@builder.io/app-context',
    '@builder.io/plugin-tools': '@builder.io/plugin-tools',
    "@emotion/core": "@emotion/core",
    "react": "react",
    "react-dom": "react-dom"
  },
  output: {
    filename: pkg.output,
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'system',
    publicPath: '/',
  },
  resolve: {
    extensions: [".wasm", ".ts", ".tsx", ".mjs", ".cjs", ".js", '.jsx', ".json"],
  },
  module: {
    rules: [
      {
        test: /\.ts$|tsx/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
  devServer: {
    port: 1268,
    static: {
      directory: path.join(__dirname, './dist'),
    },
    headers: {
      'Access-Control-Allow-Private-Network': 'true',
      'Access-Control-Allow-Origin': '*',
    },
  },
};
