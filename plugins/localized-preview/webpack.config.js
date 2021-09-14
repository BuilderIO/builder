const path = require('path')
const pkg = require('./package.json')
module.exports = {
  entry: `./src/plugin.ts`,
  externals: {
    // Only the below modules should be listed, these are the dependencies shared with
    // the Builder.io webapp
    react: 'react',
    'react-dom': 'react-dom',
    '@builder.io/sdk': '@builder.io/sdk',
    '@builder.io/react': '@builder.io/react',
    '@emotion/core': '@emotion/core',
    '@emotion/styled': '@emotion/styled',
    mobx: 'mobx',
    'mobx-state-tree': 'mobx-state-tree',
    'mobx-react': 'mobx-react',
    '@builder.io/app-context': '@builder.io/app-context',
    '@material-ui/core': '@material-ui/core',
    '@material-ui/icons': '@material-ui/icons',
    ses: 'ses',
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
}
