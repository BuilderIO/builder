const path = require("path");
const pkg = require("./package.json");

module.exports = {
  entry: `./src/${pkg.entry}.jsx`,
  externals: {
    "@builder.io/react": "@builder.io/react",
    "@builder.io/app-context": "@builder.io/app-context",
    react: "react",
    "react-dom": "react-dom",
    "@material-ui/core": "@material-ui/core",
    "@emotion/react": "@emotion/react",
    "@material-ui/icons": "@material-ui/icons",
  },
  output: {
    filename: pkg.output,
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "system",
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
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
