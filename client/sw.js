/* global importScripts workbox */

importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js"
);

const HTML_CACHE = "html";
const JS_CACHE = "javascript";
const CSS_CACHE = "css";
const JSON_CACHE = "json";
const STYLE_CACHE = "stylesheets";
const AUDIO_CACHE = "audio";
const IMAGE_CACHE = "images";
const FONT_CACHE = "fonts";

workbox.core.setCacheNameDetails({
  prefix: "gizmo"
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

workbox.routing.registerRoute(
  /.*\.((ht|x)ml?x?)|ejs$/i,
  new workbox.strategies.NetworkFirst({
    cacheName: HTML_CACHE,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10
      })
    ]
  })
);

workbox.routing.registerRoute(
  /.*\.m?js$/i,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: JS_CACHE,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 15
      })
    ]
  })
);

workbox.routing.registerRoute(
  /.*\.s?[ac]ss$/i,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CSS_CACHE,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 15
      })
    ]
  })
);

workbox.routing.registerRoute(
  /.*\.json5?$/i,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: JSON_CACHE,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 15
      })
    ]
  })
);

workbox.routing.registerRoute(
  /.*\.s[ac]ss$/i,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: STYLE_CACHE,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 15
      })
    ]
  })
);

workbox.routing.registerRoute(
  /.*\.(mp3|wav)$/i,
  new workbox.strategies.CacheFirst({
    cacheName: AUDIO_CACHE,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [200]
      }),
      new workbox.rangeRequests.RangeRequestsPlugin()
    ]
  })
);

workbox.routing.registerRoute(
  /.*\.(png|svg|jpe?g|gif)$/i,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: IMAGE_CACHE
    // plugins: [
    //   new workbox.expiration.ExpirationPlugin({
    //     maxEntries: 15
    //   })
    // ]
  })
);

workbox.routing.registerRoute(
  /.*\.(woff|woff2|eot|ttf|otf)$/i,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: FONT_CACHE,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 15
      })
    ]
  })
);

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
