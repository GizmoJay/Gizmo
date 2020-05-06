import Packets from "./packets";
import Messages from "./messages";

class Socket {
  constructor(game) {
    this.game = game;
    this.config = this.game.app.config;
    this.connection = null;

    this.listening = false;

    this.disconnected = false;

    this.messages = new Messages(this.game.app);
  }

  /**
   * Asks the hub for a server to connect to.
   * The connection assumes it is a hub, if it's not,
   * we default to normal server connection.
   */

  getServer(callback) {
    let url = "http://" + this.config.ip + ":" + this.config.port + "/server";

    if (this.config.ssl) {
      url = "https://" + this.config.ip + "/server";
    }

    // FIXME: for Hub
    // $.get(url)
    // .done(data => {
    // callback(data);
    // })
    // .fail(() => {
    callback("error");
    // });
  }

  connect() {
    this.getServer(result => {
      let url;

      if (result === "error") {
        if (this.config.ssl) {
          url = "wss://" + this.config.ip;
        } else {
          url = "ws://" + this.config.ip + ":" + this.config.port;
        }
      } else {
        if (this.config.ssl) {
          url = "wss://" + result.host;
        } else {
          url = "ws://" + result.host + ":" + result.port;
        }
      }

      this.connection = io(url, {
        forceNew: true,
        reconnection: false
      });

      this.connection.on("connect_error", () => {
        log.info("Failed to connect to: " + this.config.ip);

        this.listening = false;

        this.game.app.toggleLogin(false);

        if (this.game.isDebug()) {
          this.game.app.sendError(
            null,
            "Couldn't connect to " + this.config.ip + ":" + this.config.port
          );
        } else {
          this.game.app.sendError(
            null,
            "Could not connect to the game server."
          );
        }
      });

      this.connection.on("connect", () => {
        this.listening = true;

        log.info("Connection established...");

        this.game.app.updateLoader("Preparing Handshake");

        this.connection.emit("client", {
          gVer: this.config.version,
          cType: "HTML5"
        });
      });

      this.connection.on("message", message => {
        const actualMessage = message.message ? message.message : message;

        this.receive(actualMessage);
      });

      this.connection.on("disconnect", () => {
        this.game.handleDisconnection();
      });
    });
  }

  receive(message) {
    if (!this.listening) {
      return;
    }

    if (message.startsWith("[")) {
      const data = JSON.parse(message);

      if (data.length > 1) {
        this.messages.handleBulkData(data);
      } else {
        this.messages.handleData(JSON.parse(message).shift());
      }
    } else {
      this.messages.handleUTF8(message);
    }
  }

  send(packet, data) {
    const json = JSON.stringify([packet, data]);

    if (this.connection && this.connection.connected) {
      this.connection.send(json);
    }
  }
}
export default Socket;
