const path = require('path')
const pkg = require('./package.json')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

const config = {
  entry: `./src/${pkg.entry}.tsx`,
  externals: {
    react: 'react',
    '@builder.io/sdk': '@builder.io/sdk',
    '@material-ui/core': '@material-ui/core',
    '@emotion/core': '@emotion/core',
    '@emotion/styled': '@emotion/styled',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '*'],
  },
  module: {
    rules: [
      {
        rules: [
          {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
          },
        ],
      },
      {
        test: /monaco-editor[\\/].*\.js$/,
        loader: 'babel-loader',
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.(ts|tsx|js)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
    ],
  },
  plugins: [new MonacoWebpackPlugin({ languages: ['html'] })],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 1268,
    headers: {
      'Access-Control-Allow-Private-Network': 'true',
      'Access-Control-Allow-Origin': '*',
    },
  },
}

module.exports = config
