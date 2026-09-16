const path = require("path");
const pkg = require("./package.json");
const { ThirdPartyNoticesPlugin } = require("./scripts/third-party-notices.cjs");

module.exports = {
  entry: `./src/${pkg.entry}.jsx`,
  plugins: [new ThirdPartyNoticesPlugin()],
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
    clean: true,
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
    client: {
      overlay: false,
    },
    static: {
      directory: path.join(__dirname, "./dist"),
    },
    headers: {
      "Access-Control-Allow-Private-Network": "true",
      "Access-Control-Allow-Origin": "*",
    },
  },
};
