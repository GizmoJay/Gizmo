require("dotenv").config();
const fs = require("fs");
const path = require("path");

const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const WebpackPwaManifest = require("webpack-pwa-manifest");
const WorkboxPlugin = require("workbox-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const { version, description } = require("./package.json");

const manifest = JSON.parse(
  fs.readFileSync("./client/manifest.webmanifest", "utf8")
);

const inProduction = process.env.NODE_ENV === "production";

const entry = ["./js/main.js", "./scss/home.scss"];
if (!inProduction) {
  entry.unshift(
    "webpack-hot-middleware/client?path=/__webpack_hmr&reload=true"
  );
}

/**
 * Client Config
 */
module.exports = {
  name: "Client",
  target: "web",
  mode: process.env.NODE_ENV || "development",
  // watch: !inProduction,
  context: path.join(__dirname, "client"),
  entry,
  devtool: inProduction ? "" : "inline-source-map", // ? "source-map" // If we want source maps in production
  output: {
    path: path.join(__dirname, "client-dist"),
    filename: "js/[name].[hash:8].js",
    chunkFilename: "js/[name].[chunkhash].js",
    libraryTarget: "amd"
    // globalObject: "this"
  },
  devServer: {
    contentBase: "./client-dist",
    historyApiFallback: true,
    port: process.env.PORT,
    hot: true,
    inline: true,
    host: "localhost"
  },
  optimization: {
    noEmitOnErrors: true,
    minimize: true, // Uncompressed code now caps the Cache Quota limit 😅
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            booleans_as_integers: true,
            drop_console: inProduction,
            drop_debugger: inProduction
          },
          output: {
            comments: !inProduction,
            safari10: true
          },
          mangle: {
            safari10: true
          }
        }
      })
    ]
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.m?js$/i,
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
          inProduction ? MiniCssExtractPlugin.loader : "style-loader",
          {
            loader: "css-loader",
            options: {
              sourceMap: !inProduction
            }
          },
          "postcss-loader",
          {
            loader: "sass-loader",
            options: {
              sourceMap: !inProduction
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpe?g|gif)$/i,
        loader: "file-loader",
        options: {
          outputPath: "img",
          publicPath: "img"
        }
      },
      {
        test: /\.(mp3|wav)$/i,
        loader: "file-loader",
        options: {
          outputPath: "audio",
          publicPath: "audio"
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        loader: "url-loader"
      },
      {
        test: /\.xml$/i,
        loader: "xml-loader"
      }
      // {
      //   test: /(manifest\.webmanifest|browserconfig\.xml)$/,
      //   use: [
      //     "file-loader",
      //     "app-manifest-loader"
      //   ]
      // }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin({
      multiStep: true
    }),
    new CleanWebpackPlugin({
      // copyUnmodified: !inProduction
    }),
    new CopyPlugin([
      { from: "lib/require.js", to: "lib/require.js" },
      "browserconfig.xml",
      "favicon.ico"
    ]),
    new HtmlWebpackPlugin({
      title: "Gizmo",
      base: "./",
      template: "index.html",
      favicon: "./img/favicon.png",
      hash: true,
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
    new MiniCssExtractPlugin({
      filename: "[name].[hash:8].css",
      chunkFilename: "[name].[chunkhash].css"
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      _: "underscore",
      io: "socket.io-client",
      log: [path.resolve("./client/js/lib/log"), "default"],
      Modules: [path.resolve("./client/js/utils/modules"), "default"],
      Packets: [path.resolve("./client/js/network/packets"), "default"],
      Detect: [path.resolve("./client/js/utils/detect"), "default"],
      illuminated: [path.resolve("./client/lib/illuminated"), "default"]
    }),
    new WebpackPwaManifest(
      Object.assign(manifest, {
        inject: true,
        fingerprints: true,
        filename: "[name].[ext]",
        version,
        description,
        clientsClaim: true,
        skipWaiting: true,
        crossorigin: "use-credentials",
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
      maximumFileSizeToCacheInBytes: 6e6
    })
  ]
};
