require("dotenv").config();
const World = require("./game/world");
const WebSocket = require("./network/websocket");
const Log = require("./util/log");
const Parser = require("./util/parser");
const Database = require("./database/database");

config = require("../config");
log = new Log();

class Main {
  constructor() {
    log.info("Initializing " + config.name + " game engine...");

    this.webSocket = new WebSocket(config.host, config.port, config.gver);
    this.database = new Database(config.database);
    this.parser = new Parser();
    this.world = null;

    this.webSocket.onWebSocketReady(() => {
      /**
       * Initialize the world after we have finished loading
       * the websocket.
       */

      const onWorldLoad = () => {
        log.notice("World has successfully been created.");

        if (!config.allowConnectionsToggle) this.world.allowConnections = true;

        const host = config.host === "0.0.0.0" ? "localhost" : config.host;
        log.notice("Connect locally via http://" + host + ":" + config.port);
      };

      this.world = new World(this.webSocket, this.getDatabase());

      this.world.load(onWorldLoad);
    });

    this.webSocket.onConnect(connection => {
      if (this.world.allowConnections) {
        if (this.world.isFull()) {
          log.info(
            "All the worlds are currently full. Please try again later."
          );

          connection.sendUTF8("full");
          connection.close();
        } else this.world.playerConnectCallback(connection);
      } else {
        connection.sendUTF8("disallowed");
        connection.close();
      }
    });

    this.loadConsole();
  }

  loadConsole() {
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
            `There are a total of ${this.getPopulation()} player(s) logged in.`
          );

          break;

        case "registered":
          this.world.database.registeredCount(count => {
            log.info(`There are ${count} users registered.`);
          });

          break;

        case "kill":
          username = blocks.join(" ");

          if (!this.world.isOnline(username)) {
            log.info("Player is not logged in.");
            return;
          }

          player = this.world.getPlayerByName(username);

          if (!player) {
            log.info("An error has occurred.");
            return;
          }

          this.world.kill(player);

          break;

        case "resetPositions": {
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

          this.world.database.resetPositions(newX, newY, result => {
            log.info(result);
          });

          break;
        }

        case "allowConnections":
          this.world.allowConnections = !this.world.allowConnections;

          if (this.world.allowConnections) {
            log.info("Server is now allowing connections.");
          } else log.info("The server is not allowing connections.");

          break;

        case "give": {
          const itemId = blocks.shift();
          const itemCount = parseInt(blocks.shift());

          username = blocks.join(" ");

          player = this.world.getPlayerByName(username);

          if (!player) return;

          player.inventory.add({
            id: itemId,
            count: itemCount,
            ability: -1,
            abilityLevel: -1
          });

          break;
        }
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

new Main();
