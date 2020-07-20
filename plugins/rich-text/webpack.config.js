const path = require('path');
const pkg = require('./package.json');
module.exports = {
  entry: `./src/${pkg.entry}.tsx`,
  externals: {
    react: 'react',
    '@builder.io/sdk': '@builder.io/sdk',
    '@material-ui/core': '@material-ui/core',
    '@emotion/core': '@emotion/core',
    '@emotion/styled': '@emotion/styled',
  },
  output: {
    filename: pkg.output,
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'system',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
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
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
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
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 1268,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};
