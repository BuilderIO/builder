// contents of webpack.config.js
const path = require("path");
const pkg = require("./package.json");

module.exports = {
  entry: `./src/${pkg.entry}.tsx`,
  externals: {
    "@builder.io/react": "@builder.io/react",
    "@builder.io/app-context": "@builder.io/app-context",
    "@emotion/core": "@emotion/core",
    react: "react",
    "react-dom": "react-dom",
  },
  output: {
    filename: pkg.output,
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "system",
  },
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts"],
  },
  module: {
    rules: [
      {
        test: /\.(jsx|tsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          transpileOnly: true, // Improve performance for dev builds
        },
      },
    ],
  },
  devServer: {
    port: 1268,
    static: {
      directory: path.join(__dirname, "./dist"),
    },
    headers: {
      "Access-Control-Allow-Private-Network": "true",
      "Access-Control-Allow-Origin": "*",
    },
  },
};
