require("dotenv").config();
const path = require("path");

const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackTagsPlugin = require("html-webpack-tags-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const WebpackPwaManifest = require("webpack-pwa-manifest");
const WorkboxPlugin = require("workbox-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const { version } = require("./package.json");
const manifest = require("./client/manifest.json");

const inProduction = process.env.NODE_ENV === "production";

/**
 * TODO: Convert Server from CommonJS to ES2020 and bunlde with Dynamic Imports
 * TODO: Bundling the CSS for some reason gets rid of background and map image data.
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
  entry: [
    // "./index.html"
    "./js/lib/home.js"
    //, "./css/main.css"
  ],
  devtool: inProduction ? "" : "inline-source-map", // ? "source-map"
  output: {
    path: path.join(__dirname, "client-dist"),
    filename: "js/[name].[hash:8].js",
    chunkFilename: "js/[name].[chunkhash].js",
    libraryTarget: "amd"
  },
  devServer: {
    contentBase: "./client-dist",
    historyApiFallback: true,
    hot: true,
    inline: true
  },
  module: {
    rules: [
      // {
      //   test: /\.html?$/i,
      //   loader: "html-loader"
      // },
      {
        enforce: "pre",
        test: /\.js$/i,
        exclude: /(node_modules|bower_components)/,
        use: "eslint-loader"
      },
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
        test: /\w+worker\.js$/,
        loader: "worker-loader",
        options: { inline: true, fallback: false }
      },
      {
        test: /\.s?[ac]ss$/i,
        use: [
          // MiniCssExtractPlugin.loader,
          "css-loader"
          // "postcss-loader"
        ]
      },
      {
        test: /\.(png|svg|jpe?g|gif)$/i,
        loader: "file-loader"
        // options: {
        //   // name: "[name].[ext]",
        //   outputPath: "img",
        //   publicPath: "img"
        // }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        loader: "url-loader"
        // options: {
        //   outputPath: "fonts",
        //   publicPath: "fonts"
        // }
      },
      {
        test: /\.xml$/i,
        loader: "xml-loader"
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin({
      multiStep: true
    }),

    new CleanWebpackPlugin(
      // For Debugging
      { copyUnmodified: true, cleanStaleWebpackAssets: false }
    ),
    new CopyPlugin([
      { from: "audio", to: "audio" },
      { from: "css", to: "css" },
      { from: "data", to: "data" },
      { from: "fonts", to: "fonts" },
      { from: "img", to: "img" },
      { from: "lib", to: "lib" },
      { from: "js/map/mapworker.js", to: "js/map/mapworker.js" }, // TODO: Dynamically combine the `mapworker.js` worker file with main
      { from: "js/lib", to: "js/lib" }, // TODO: Combine `js/lib` directory with main
      { from: "js/utils", to: "js/utils" }, // TODO: Combine `js/utils` directory with main
      "browserconfig.xml",
      "favicon.ico"
    ]),
    new HtmlWebpackPlugin({
      title: "Gizmo",
      base: "./",
      template: "index.html",
      favicon: "./img/favicon.png",
      inject: false,
      minify: inProduction
        ? {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          processScripts: ["application/ld+json"]
        }
        : false
    }),
    new MiniCssExtractPlugin(),
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
  ]
};
