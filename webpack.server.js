require("dotenv").config();
const path = require("path");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

// const inProduction = process.env.NODE_ENV === "production";

/**
 * Server
 */
module.exports = {
  name: "Server",
  target: "node",
  mode: process.env.NODE_ENV || "development",
  // watch: !inProduction,
  context: path.join(__dirname, "server"),
  entry: "./js/main.js",
  devtool: "source-map",
  output: {
    path: path.join(__dirname, "dist"),
    library: "[name]",
    filename: "[name].js",
    libraryTarget: "commonjs2"
  },
  externals: [nodeExternals()],
  plugins: [new CleanWebpackPlugin(), new CopyPlugin(["**"])],
  module: {
    rules: [
      // {
      //   enforce: "pre",
      //   test: /\.js$/i,
      //   exclude: /(node_modules|bower_components)/,
      //   use: "eslint-loader"
      // },
      {
        test: /\.js$/i,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    node: "current"
                  }
                }
              ]
            ]
          }
        }
      }
    ]
  }
};
