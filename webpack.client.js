require("dotenv").config();
const path = require("path");

const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const WebpackPwaManifest = require("webpack-pwa-manifest");
const WorkboxPlugin = require("workbox-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const { version } = require("./package.json");
const manifest = require("./client/manifest.json");

const inProduction = process.env.NODE_ENV === "production";

/**
 * TODO: Convert from AMD to ES2020
 */

/**
 * Client
 */
module.exports = {
  name: "Client",
  target: "web",
  mode: process.env.NODE_ENV || "development",
  // watch: !inProduction,
  context: path.join(__dirname, "client"),
  entry: "./js/lib/home.js",
  devtool: "source-map",
  output: {
    path: path.join(__dirname, "client-dist"),
    filename: "js/[name].[hash:8].js",
    libraryTarget: "amd"
  },
  externals: {
    jquery: "/js/lib/jquery.js"
  },
  resolve: {
    alias: {
      jquery: "/js/lib/jquery.js"
    }
  },
  // devServer: {
  //   historyApiFallback: true,
  //   hot: true,
  //   inline: true
  // },
  plugins: [
    // new webpack.HotModuleReplacementPlugin({
    //   multiStep: true
    // }),

    new CleanWebpackPlugin(),
    new CopyPlugin([
      { from: "audio", to: "audio" },
      { from: "css", to: "css" },
      { from: "data", to: "data" },
      { from: "fonts", to: "fonts" },
      { from: "img", to: "img" },
      { from: "lib", to: "lib" },
      { from: "js/map/mapworker.js", to: "js/map/mapworker.js" },
      { from: "js/lib", to: "js/lib" }, // TODO: Combine `lib/` directory with main
      { from: "js/utils", to: "js/utils" }, // TODO: Combine `utils/` directory with main
      "browserconfig.xml",
      "favicon.ico"
    ]),
    new HtmlWebpackPlugin({
      title: "Gizmo",
      base: "./",
      template: "index.html",
      inject: false,
      minify: !inProduction
        ? false
        : {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            processScripts: ["application/ld+json"]
          }
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new WebpackPwaManifest(
      Object.assign(manifest, {
        version,
        icons: [
          {
            src: path.resolve(
              __dirname,
              "client/img/icons/android-chrome-36x36.png"
            ),
            sizes: "36x36",
            destination: path.join("img", "icons"),
            type: "image/png"
          },
          {
            src: path.resolve(
              __dirname,
              "client/img/icons/android-chrome-48x48.png"
            ),
            sizes: "48x48",
            destination: path.join("img", "icons"),
            type: "image/png"
          },
          {
            src: path.resolve(
              __dirname,
              "client/img/icons/android-chrome-72x72.png"
            ),
            sizes: "72x72",
            destination: path.join("img", "icons"),
            type: "image/png"
          },
          {
            src: path.resolve(
              __dirname,
              "client/img/icons/android-chrome-96x96.png"
            ),
            sizes: "96x96",
            destination: path.join("img", "icons"),
            type: "image/png"
          },
          {
            src: path.resolve(
              __dirname,
              "client/img/icons/android-chrome-144x144.png"
            ),
            sizes: "144x144",
            destination: path.join("img", "icons"),
            type: "image/png"
          },
          {
            src: path.resolve(
              __dirname,
              "client/img/icons/android-chrome-192x192.png"
            ),
            sizes: "192x192",
            destination: path.join("img", "icons"),
            type: "image/png"
          }
        ]
      })
    ),
    new WorkboxPlugin.InjectManifest({
      swSrc: "./sw.js",
      maximumFileSizeToCacheInBytes: 5e6
    })
  ],
  module: {
    rules: [
      // {
      //   enforce: "pre",
      //   test: /\.js$/i,
      //   exclude: /(node_modules|bower_components)/,
      //   use: "eslint-loader"
      // },
      {
        test: /\.m?js$/i,
        exclude: /(node_modules|bower_components)/,

        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      },
      {
        test: /\.s?[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } },
          "postcss-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf)$/i,
        use: ["file-loader"]
      },
      {
        test: /\.xml$/,
        use: ["xml-loader"]
      }
    ]
  }
};
