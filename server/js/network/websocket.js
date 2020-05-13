/* global module */

const fs = require("fs");
const Socket = require("./socket");
const Connection = require("./connection");
const connect = require("connect");
const serve = require("serve-static");
const request = require("request");
const SocketIO = require("socket.io");
const webpack = require("webpack");
const webpackConfig = require(process.env.WEBPACK_CONFIG
  ? process.env.WEBPACK_CONFIG
  : "../../../webpack.config");
const compiler = webpack(webpackConfig);
const http = require("http");
const https = require("https");
const http2 = require("http2");
const Utils = require("../util/utils");

class WebSocket extends Socket {
  constructor(host, port, version) {
    super(port);

    this.host = host;
    this.version = version;

    this.ips = {};

    const app = connect();
    if (webpackConfig.mode === "development") {
      app.use(
        require("webpack-dev-middleware")(compiler, {
          publicPath: webpackConfig.output.publicPath
        })
      );
      app.use(
        require("webpack-hot-middleware")(compiler, {
          path: "/__webpack_hmr",
          heartbeat: 10 * 1000
        })
      );
    }
    app.use(serve("client-dist", { index: ["index.html"] }), null);

    const readyWebSocket = port => {
      log.info("Server is now listening on: " + port);

      if (this.webSocketReadyCallback) this.webSocketReadyCallback();
    };

    if (config.ssl) {
      this.httpServer = http2
        .createSecureServer(
          {
            key: fs.readFileSync("security/cert.key", "utf8"),
            cert: fs.readFileSync("security/cert.pem", "utf8")
          },
          app
        )
        .listen(port, host, () => {
          readyWebSocket(port);
        });
    } else {
      this.httpServer = http
        .createServer(app)
        .listen(port, host, () => {
          readyWebSocket(port);
        });
    }

    this.io = new SocketIO(this.httpServer, {
      cookie: false,
      secure: config.ssl
    });
    this.io.on("connection", socket => {
      if (socket.handshake.headers["cf-connecting-ip"]) {
        socket.conn.remoteAddress =
          socket.handshake.headers["cf-connecting-ip"];
      }

      log.info("Received connection from: " + socket.conn.remoteAddress);

      const client = new Connection(this.createId(), socket, this);

      socket.on("client", data => {
        if (this.connectionCallback) this.connectionCallback(client);

        this.addConnection(client);
      });
    });
  }

  createId() {
    return "1" + Utils.random(9999) + "" + this._counter++;
  }

  onConnect(callback) {
    this.connectionCallback = callback;
  }

  onWebSocketReady(callback) {
    this.webSocketReadyCallback = callback;
  }
}

module.exports = WebSocket;
