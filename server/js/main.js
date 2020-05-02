const World = require("./game/world");
const WebSocket = require("./network/websocket");
const Log = require("./util/log");
const Parser = require("./util/parser");
const Database = require("./database/database");

config = require("../config");
log = new Log();

class Main {
  constructor() {
    const self = this;

    log.info("Initializing " + config.name + " game engine...");

    self.webSocket = new WebSocket(config.host, config.port, config.gver);
    self.database = new Database(config.database);
    self.parser = new Parser();
    self.world = null;

    self.webSocket.onWebSocketReady(() => {
      /**
       * Initialize the world after we have finished loading
       * the websocket.
       */

      const onWorldLoad = () => {
        log.notice("World has successfully been created.");

        if (!config.allowConnectionsToggle) self.world.allowConnections = true;

        let host = config.host === "0.0.0.0" ? "localhost" : config.host;
        log.notice("Connect locally via http://" + host + ":" + config.port);
      };

      self.world = new World(self.webSocket, self.getDatabase());

      self.world.load(onWorldLoad);
    });

    self.webSocket.onConnect(connection => {
      if (self.world.allowConnections) {
        if (self.world.isFull()) {
          log.info(
            "All the worlds are currently full. Please try again later."
          );

          connection.sendUTF8("full");
          connection.close();
        } else self.world.playerConnectCallback(connection);
      } else {
        connection.sendUTF8("disallowed");
        connection.close();
      }
    });

    self.loadConsole();
  }

  loadConsole() {
    const self = this;
    const stdin = process.openStdin();

    stdin.addListener("data", data => {
      const message = data.toString().replace(/(\r\n|\n|\r)/gm, "");
      const type = message.charAt(0);

      if (type !== "/") return;

      const blocks = message.substring(1).split(" ");
      const command = blocks.shift();

      if (!command) return;

      let username, player;

      switch (command) {
        case "players":
          log.info(
            `There are a total of ${self.getPopulation()} player(s) logged in.`
          );

          break;

        case "registered":
          self.world.database.registeredCount(count => {
            log.info(`There are ${count} users registered.`);
          });

          break;

        case "kill":
          username = blocks.join(" ");

          if (!self.world.isOnline(username)) {
            log.info("Player is not logged in.");
            return;
          }

          player = self.world.getPlayerByName(username);

          if (!player) {
            log.info("An error has occurred.");
            return;
          }

          self.world.kill(player);

          break;

        case "resetPositions":
          const newX = parseInt(blocks.shift());
          const newY = parseInt(blocks.shift());

          // x: 325, y: 87

          if (!newX || !newY) {
            log.info(
              "Invalid command parameters. Expected: /resetPositions <newX> <newY>"
            );
            return;
          }

          /**
           * We are iterating through all of the users in the database
           * and resetting their position to the paramters inputted.
           * This is to be used when doing some game-breaking map
           * updates. This command is best used in tandem with the
           * `allowConnectionsToggle` to prevent users from logging
           * in.
           */

          self.world.database.resetPositions(newX, newY, result => {
            log.info(result);
          });

          break;

        case "allowConnections":
          self.world.allowConnections = !self.world.allowConnections;

          if (self.world.allowConnections) {
            log.info("Server is now allowing connections.");
          } else log.info("The server is not allowing connections.");

          break;

        case "give":
          const itemId = blocks.shift();
          const itemCount = parseInt(blocks.shift());

          username = blocks.join(" ");

          player = self.world.getPlayerByName(username);

          if (!player) return;

          player.inventory.add({
            id: itemId,
            count: itemCount,
            ability: -1,
            abilityLevel: -1
          });

          break;
      }
    });
  }

  getDatabase() {
    return this.database.getDatabase();
  }

  getPopulation() {
    return this.world.getPopulation();
  }
}

module.exports = Main;

// eslint-disable-next-line no-new
new Main();
